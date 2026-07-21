import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // We need an organization ID. Let's get the first one.
  const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
  if (!orgs || orgs.length === 0) {
    console.error("No organizations found");
    return;
  }
  const orgId = orgs[0].id;
  
  console.log("Inserting alert for org:", orgId);
  const { data: alert, error } = await supabase.from("alerts").insert({
    organization_id: orgId,
    alert_type: "Malware Detection Test",
    source_system: "EDR",
    severity: "Critical",
    status: "New",
    raw_log: { message: "Test malware detected" }
  }).select("id").single();
  
  if (error) {
    console.error("Insert error:", error);
    return;
  }
  
  console.log("Inserted alert:", alert.id);
  console.log("Waiting 10 seconds for AI processing...");
  await new Promise(r => setTimeout(r, 10000));
  
  // Check if alert was updated
  const { data: updatedAlert } = await supabase.from("alerts").select("status, risk_score, ai_analyzed_at").eq("id", alert.id).single();
  console.log("Updated Alert Status:", updatedAlert?.status);
  console.log("AI Analyzed At:", updatedAlert?.ai_analyzed_at);
  console.log("Risk Score:", updatedAlert?.risk_score);
  
  // Check for incident correlation
  const { data: mapping } = await supabase.from("alert_incident_map").select("incident_id").eq("alert_id", alert.id);
  if (mapping && mapping.length > 0) {
    console.log("Correlated to incident:", mapping[0].incident_id);
  } else {
    console.log("No incident correlated.");
  }
}

test();

