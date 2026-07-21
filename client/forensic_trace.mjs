import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runTrace() {
  console.log("=== FORENSIC TRACE ===");

  // 1. Create a test organization
  const { data: org, error: orgErr } = await adminClient
    .from('organizations')
    .insert({ name: `Forensic Org ${Date.now()}`, sector: 'Testing' })
    .select().single();
    
  if (orgErr) throw new Error("Failed to create org: " + orgErr.message);
  console.log(`[x] Created Organization: ${org.id}`);

  // 2. Create a test user for the Alert Source
  const testEmail = `forensic.source.${Date.now()}@example.com`;
  const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: 'password123',
    email_confirm: true
  });
  
  if (authErr) throw new Error("Failed to create user: " + authErr.message);
  const userId = authUser.user.id;
  console.log(`[x] 1. Alert Source user ID: ${userId}`);

  // 3. Add user to organization
  const { error: memberErr } = await adminClient
    .from('organization_members')
    .insert({ organization_id: org.id, user_id: userId, role: 'admin' });
    
  if (memberErr) throw new Error("Failed to add member: " + memberErr.message);
  console.log(`[x] 2. Alert Source organization_id: ${org.id}`);

  // Sign in as this user to get a JWT and simulate real client behavior
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error: signInErr } = await userClient.auth.signInWithPassword({
    email: testEmail,
    password: 'password123'
  });
  if (signInErr) throw new Error("Failed to sign in: " + signInErr.message);

  // 4. Insert an alert as the Alert Source user (testing INSERT RLS)
  console.log("[ ] 3. Inserting alert into the 'alerts' table via userClient...");
  const alertPayload = {
    organization_id: org.id,
    alert_type: 'Forensic Test',
    severity: 'Critical',
    source_system: 'TraceTool',
    status: 'New',
    timestamp: new Date().toISOString(),
    raw_log: JSON.stringify({ trace: true }),
    metadata: { trace: true }
  };
  
  const { data: insertedAlert, error: insertErr } = await userClient
    .from('alerts')
    .insert(alertPayload)
    .select()
    .single();
    
  if (insertErr) {
    console.error("FAILED TO INSERT ALERT AS USER:", insertErr);
    // fallback to insert as admin if RLS prevents insert
    const { data: adminInsert, error: adminErr } = await adminClient
      .from('alerts')
      .insert(alertPayload)
      .select()
      .single();
    console.log("Admin insert succeeded:", adminInsert.id);
  } else {
    console.log(`[x] 3. Alert inserted into the 'alerts' table. ID: ${insertedAlert.id}`);
  }

  // 5. Complete alert database record
  const { data: rawRecord } = await adminClient
    .from('alerts')
    .select('*')
    .eq('organization_id', org.id)
    .single();
    
  console.log(`[x] 4. Complete alert database record:`, rawRecord);

  console.log(`[x] 5. Security Analyst user ID: ${userId}`);
  console.log(`[x] 6. Security Analyst organization_id: ${org.id}`);
  console.log(`[x] 7. Active organization selected: ${org.id}`);

  // 6. Execute Dashboard Query
  console.log("[ ] 8. Exact SQL/Supabase query executed by the dashboard:");
  console.log(`    userClient.from('alerts').select('*').eq('organization_id', '${org.id}').order('created_at', { ascending: false })`);
  
  const { data: queryData, error: queryErr } = await userClient
    .from('alerts')
    .select('*')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false });

  if (queryErr) {
    console.error("Query Error:", queryErr);
  } else {
    console.log(`[x] 9. Number of rows returned by the query: ${queryData.length}`);
    if (queryData.length === 0) {
      console.log(`[!] 10. RLS filtered the rows! The query returned 0 rows for the Security Analyst.`);
    } else {
      console.log(`[x] 10. RLS allowed the rows. Data received.`);
    }
  }

  console.log("\n=== Checking RLS Policies ===");
  const { data: policies } = await adminClient.rpc('get_policies_for_table', { table_name: 'alerts' }).catch(() => ({ data: 'RPC not available' }));
  console.log(policies);
}

runTrace().catch(console.error);
