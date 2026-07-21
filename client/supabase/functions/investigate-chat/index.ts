
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizeAlertForPrompt } from "../_shared/sanitize.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: membership, error: membershipError } = await userClient
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .maybeSingle();

    const ALLOWED_ROLES = ['analyst', 'admin', 'org_admin', 'security_officer'];
    if (membershipError || !membership || !ALLOWED_ROLES.includes(membership.role)) {
      return new Response(
        JSON.stringify({ error: 'Analyst access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { incidentId, messages } = await req.json();

    if (!incidentId || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Missing incidentId or valid messages array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (incidentError || !incident) {
      return new Response(
        JSON.stringify({ error: 'Incident not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (incident.organization_id !== membership.organization_id && membership.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: incident belongs to another organization' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    const { data: mappings } = await supabase
      .from('alert_incident_map')
      .select('alert_id')
      .eq('incident_id', incidentId);

    let alertsContext = "No correlated alerts available.";
    if (mappings && mappings.length > 0) {
      const alertIds = mappings.map((m: any) => m.alert_id);
      const { data: alertData } = await supabase
        .from('alerts')
        .select('*')
        .in('id', alertIds);

      if (alertData && alertData.length > 0) {
        alertsContext = JSON.stringify(alertData.map((a: any) => {
          const sanitized = sanitizeAlertForPrompt(a);
          return {
            type: sanitized.alert_type,
            source: sanitized.source_system,
            severity: sanitized.severity,
            timestamp: sanitized.timestamp,
            raw_log: sanitized.raw_log,
          };
        }), null, 2);
      }
    }

    const openAIApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ reply: "I'm sorry, the AI investigation service is currently unavailable. Please check your API key configuration." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemMessage = {
      role: 'system',
      content: `You are an expert Defense Analyst AI assisting a human analyst with an ongoing incident investigation.
You have the following context about the incident:
Incident ID: ${incident.id}
Reason: ${incident.incident_reason || 'Unknown'}
Severity: ${incident.severity}
Status: ${incident.status}
AI Summary (if any): ${incident.ai_summary || 'None'}

Correlated Alerts:
${alertsContext}

Provide concise, highly technical, and actionable responses. Focus on threat hunting, malware analysis, IOCs, and remediation.`
    };

    const apiMessages = [systemMessage, ...messages];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error('Failed to generate AI response');
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "I couldn't generate a response.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in investigate-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
