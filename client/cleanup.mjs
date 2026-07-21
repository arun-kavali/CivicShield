import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
  console.log("Cleaning up load test artifacts...");
  
  // 1. Delete all mapping table entries first (to avoid FK errors)
  await adminClient.from('alert_incident_map').delete().neq('incident_id', '00000000-0000-0000-0000-000000000000');
  
  // 2. Delete all incidents
  await adminClient.from('incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // 3. Delete all alerts
  await adminClient.from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // 4. Delete load test orgs
  await adminClient.from('organizations').delete().like('name', 'Load Test%');
  
  console.log("Cleanup complete!");
}

cleanup().catch(console.error);
