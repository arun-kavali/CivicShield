import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase Admin client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // CORS configuration
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Basic verification - checking if this request is POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { 
        status: 405, headers: corsHeaders 
      });
    }

    // Attempt to parse JSON payload
    let payload;
    try {
      payload = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), { 
        status: 400, headers: corsHeaders 
      });
    }

    // In a real production system, webhooks should be verified via signature or tokens.
    // Here we'll expect the query parameter ?org_id=XXXX to associate the alert,
    // or fallback to inspecting the payload for an org_id.
    
    const url = new URL(req.url);
    const orgId = url.searchParams.get("org_id") || payload.organization_id;

    if (!orgId) {
      return new Response(JSON.stringify({ error: "Missing org_id parameter" }), { 
        status: 400, headers: corsHeaders 
      });
    }

    // Normalize alert data
    const alertData = {
      organization_id: orgId,
      alert_type: payload.alert_type || payload.type || payload.title || "Webhook Alert",
      source_system: payload.source_system || payload.source || "REST API / Webhook",
      severity: payload.severity || payload.level || "Medium",
      raw_log: payload,
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('alerts')
      .insert(alertData)
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      throw error;
    }

    // Fire-and-forget AI analysis
    try {
      await fetch(`${supabaseUrl}/functions/v1/analyze-alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ alert_id: data.id }),
      });
    } catch (e) {
      console.warn("analyze-alert dispatch failed:", e);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Alert ingested successfully",
      alert_id: data.id 
    }), { 
      status: 201, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("Webhook ingestion error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: (error as Error).message 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
