import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing environment variables.");
  process.exit(1);
}

// Client for admin bypass checks (to verify records)
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Function to create a fresh client (representing a new user session)
function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const testResults = {
  Auth: { signup: false, login: false, logout: false },
  Org: { create: false, join: false, rls: false },
  Security: { crossOrgBlocked: false, noServiceRoleExposure: false },
  Pipeline: { alertsGenerated: false, aiTriggered: false, incidentsCorrelated: false }
};

async function runCorePAT() {
  console.log("=== Starting Core PAT ===");

  const user1Email = `test_user_1_${Date.now()}@example.com`;
  const user2Email = `test_user_2_${Date.now()}@example.com`;
  const password = "StrongPassword123!";

  console.log("\n--- TEST 1: Authentication ---");
  const client1 = createAnonClient();
  
  // Signup User 1
  const { data: signUpData, error: signUpError } = await client1.auth.signUp({
    email: user1Email,
    password: password
  });
  
  if (signUpError) {
    console.error("Signup failed:", signUpError.message);
  } else {
    console.log("✓ Signup successful");
    testResults.Auth.signup = true;
  }

  // Auto-login (GoTrue usually logs in automatically on signup if email confirmation is off)
  const { data: sessionData } = await client1.auth.getSession();
  if (sessionData.session) {
    console.log("✓ Auto-Login successful");
    testResults.Auth.login = true;
  }

  console.log("\n--- TEST 2 & 12: Organizations & Security (RLS) ---");
  
  // User 1 creates an Org
  const user1 = (await client1.auth.getUser()).data.user;
  const { data: org1, error: org1Err } = await client1.from('organizations').insert({ name: 'Org 1', created_by: user1.id }).select().single();
  if (org1Err) {
    console.error("Failed to create org 1:", org1Err.message);
  } else {
    console.log("✓ Create Organization successful");
    testResults.Org.create = true;
  }

  // Signup User 2
  const client2 = createAnonClient();
  await client2.auth.signUp({ email: user2Email, password: password });
  
  // User 2 creates Org 2
  const user2 = (await client2.auth.getUser()).data.user;
  const { data: org2 } = await client2.from('organizations').insert({ name: 'Org 2', created_by: user2.id }).select().single();

  // Test 12: User 1 attempts to read Org 2 (Should be blocked by RLS)
  if (org1 && org2) {
    const { data: testCrossOrg, error: crossOrgErr } = await client1.from('organizations').select('*').eq('id', org2.id);
    if (!crossOrgErr && testCrossOrg.length === 0) {
      console.log("✓ RLS blocks cross-organization access");
      testResults.Security.crossOrgBlocked = true;
    } else {
      console.error("FAIL: RLS did not block cross-organization access!", testCrossOrg);
    }
  }

  // Ensure Service Role key is NOT exposed to frontend env
  if (!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    console.log("✓ Service Role Key is not exposed to frontend");
    testResults.Security.noServiceRoleExposure = true;
  }

  console.log("\n--- TEST 4, 5, 6: Alert Generation & Correlation ---");
  
  if (org1) {
    // Generate Alerts
    const alertsToInsert = [
      { organization_id: org1.id, alert_type: 'Low Alert', severity: 'Low', source_system: 'Test', timestamp: new Date().toISOString() },
      { organization_id: org1.id, alert_type: 'Medium Alert', severity: 'Medium', source_system: 'Test', timestamp: new Date().toISOString() },
      { organization_id: org1.id, alert_type: 'High Alert', severity: 'High', source_system: 'Test', timestamp: new Date().toISOString() },
      { organization_id: org1.id, alert_type: 'Critical Alert', severity: 'Critical', source_system: 'Test', timestamp: new Date().toISOString() },
    ];

    console.log("Inserting Low/Med/High/Critical alerts...");
    const { data: insertedAlerts, error: insertErr } = await adminClient.from('alerts').insert(alertsToInsert).select();
    
    if (insertErr) {
      console.error("Alert insertion failed:", insertErr.message);
    } else {
      console.log("✓ Alerts inserted");
      testResults.Pipeline.alertsGenerated = true;

      // Poll for AI Processing (waiting for trigger and process-alerts)
      console.log("Waiting 15 seconds for trigger and AI fallback execution...");
      await new Promise(r => setTimeout(r, 15000));

      const { data: processedAlerts } = await adminClient.from('alerts').select('*').eq('organization_id', org1.id);
      
      let aiPassed = true;
      for (const a of processedAlerts) {
        if (!a.ai_analysis || (a.status !== 'Reviewed' && a.status !== 'Correlated')) {
          aiPassed = false;
        }
      }
      
      if (aiPassed) {
         console.log("✓ AI/Fallback processing successful for all alerts");
         testResults.Pipeline.aiTriggered = true;
      } else {
         console.error("FAIL: Not all alerts were processed by AI.");
      }

      // Check Correlation
      // The process-alerts cron job runs every minute, so we can manually invoke it to speed up testing
      console.log("Invoking process-alerts Edge Function manually to force correlation...");
      await fetch(`${SUPABASE_URL}/functions/v1/process-alerts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
      });

      console.log("Waiting 5 seconds for correlation...");
      await new Promise(r => setTimeout(r, 5000));

      const { data: incidents } = await adminClient.from('incidents').select('*').eq('organization_id', org1.id);
      if (incidents && incidents.length > 0) {
        console.log(`✓ Incidents correlated successfully (${incidents.length} created)`);
        testResults.Pipeline.incidentsCorrelated = true;
      } else {
        console.error("FAIL: No incidents correlated");
      }
    }
  }

  console.log("\n=== CORE PAT RESULTS ===");
  console.log(JSON.stringify(testResults, null, 2));
}

runCorePAT().catch(console.error);
