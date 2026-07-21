import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runLoadTest(alertCount) {
  console.log(`\n=== Starting Load Test for ${alertCount} Alerts ===`);
  
  // Create a dedicated test org for this load test
  const { data: org, error: orgErr } = await adminClient
    .from('organizations')
    .insert({ name: `Load Test Org ${alertCount}`, sector: 'Testing' })
    .select().single();
    
  if (orgErr) {
    console.error("Failed to create org:", orgErr.message);
    return;
  }
  const orgId = org.id;
  
  const startTime = Date.now();
  
  // Generate Alerts in memory
  const alerts = [];
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const types = ['SQL Injection', 'DDoS', 'Phishing', 'Malware', 'Data Exfiltration'];
  
  for (let i = 0; i < alertCount; i++) {
    alerts.push({
      organization_id: orgId,
      alert_type: types[i % types.length],
      severity: severities[i % severities.length],
      source_system: 'LoadTester',
      status: 'New',
      timestamp: new Date().toISOString(),
      raw_log: JSON.stringify({ index: i, timestamp: new Date().toISOString() }),
      metadata: { load_test: true, index: i }
    });
  }
  
  // Insert in batches of 10 with 1000ms delay to avoid pg_net queue overflow on free tier
  console.log("Inserting alerts in batches of 10 with 1000ms delays...");
  for (let i = 0; i < alerts.length; i += 10) {
    const batch = alerts.slice(i, i + 10);
    const { error } = await adminClient.from('alerts').insert(batch);
    if (error) {
      console.error(`Batch insert failed at ${i}:`, error.message);
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  
  const insertTime = (Date.now() - startTime) / 1000;
  console.log(`✓ Inserted ${alertCount} alerts in ${insertTime.toFixed(2)} seconds`);
  
  // Wait for Edge Functions (analyze-alert trigger) to finish processing all of them
  // They run concurrently. We will poll until they are all 'Reviewed' or 'Correlated'.
  console.log("Waiting for trigger functions to process all alerts...");
  let processedCount = 0;
  let processingStartTime = Date.now();
  
  for (let i = 0; i < 120; i++) { // Max wait 4 minutes
    await new Promise(r => setTimeout(r, 2000));
    const { count, error } = await adminClient
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .in('status', ['Reviewed', 'Correlated']);
      
    if (error) {
      console.error("Poll error:", error.message);
      continue;
    }
    
    processedCount = count;
    console.log(`Processed: ${processedCount} / ${alertCount}`);
    
    if (processedCount >= alertCount) break;
  }
  
  if (processedCount < alertCount) {
    console.error(`FAIL: Only ${processedCount} alerts processed out of ${alertCount}`);
    return;
  }
  
  const triggerTime = (Date.now() - processingStartTime) / 1000;
  console.log(`✓ All ${alertCount} alerts analyzed in ${triggerTime.toFixed(2)} seconds`);
  
  // Now invoke process-alerts (Correlation)
  console.log("Invoking process-alerts correlation engine...");
  const correlationStartTime = Date.now();
  
  await fetch(`${SUPABASE_URL}/functions/v1/process-alerts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
  });
  
  // Give it a moment to run
  await new Promise(r => setTimeout(r, 5000));
  
  const { data: incidents, error: incErr } = await adminClient
    .from('incidents')
    .select('id, title')
    .eq('organization_id', orgId);
    
  if (incErr) {
    console.error("Failed to fetch incidents:", incErr.message);
    return;
  }
  
  // Check for duplicates
  // A duplicate is if there are multiple incidents with the exact same title for the same org
  const titles = incidents.map(i => i.title);
  const uniqueTitles = new Set(titles);
  const duplicates = titles.length - uniqueTitles.size;
  
  const totalTime = (Date.now() - startTime) / 1000;
  
  console.log(`\n--- Load Test Results (${alertCount} Alerts) ---`);
  console.log(`Total Execution Time: ${totalTime.toFixed(2)} seconds`);
  console.log(`Incidents Generated: ${incidents.length} (Expected roughly 5 due to 5 distinct types)`);
  console.log(`Duplicate Incidents: ${duplicates}`);
  
  if (duplicates === 0 && incidents.length > 0) {
    console.log(`✓ PASS: Load test for ${alertCount} alerts succeeded with ZERO duplicates.`);
  } else {
    console.error(`FAIL: Duplicates found or zero incidents generated!`);
  }
}

async function runAll() {
  await runLoadTest(100);
  await runLoadTest(500);
  await runLoadTest(1000);
  console.log("\nAll Load Tests Completed.");
}

runAll().catch(console.error);
