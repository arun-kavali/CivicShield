
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to known application domains


function getCorsHeaders(_origin: string | null) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Verify authorization - allows service role key (for cron jobs) or admin JWT (for UI)
async function verifyAuth(req: Request): Promise<{ authorized: boolean; error?: string; organization_id?: string }> {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    return { authorized: false, error: 'Missing authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Allow service role key for cron jobs
  if (serviceRoleKey && token === serviceRoleKey) {
    console.log('Authorized via service role key (cron job)');
    return { authorized: true }; // No org ID, implies global health summary
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Create client with user's JWT
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Verify the user
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    return { authorized: false, error: 'Invalid or expired token' };
  }

  // Check if user has admin role and get org ID
  const { data: memberData, error: memberError } = await supabaseClient
    .from('organization_members')
    .select('role, organization_id')
    .eq('user_id', user.id)
    .single();

  if (memberError || (memberData?.role !== 'admin' && memberData?.role !== 'org_admin')) {
    return { authorized: false, error: 'Admin access required' };
  }

  console.log('Authorized via admin JWT for org:', memberData.organization_id);
  return { authorized: true, organization_id: memberData.organization_id };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization (service role key for cron or admin JWT for UI)
    const authResult = await verifyAuth(req);
    if (!authResult.authorized) {
      console.log('Authorization failed:', authResult.error);
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Generating daily system health summary...');

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const withOrg = (query: any) => {
      if (authResult.organization_id) {
        return query.eq('organization_id', authResult.organization_id);
      }
      return query;
    };

    // Gather statistics for the last 24 hours
    const [
      totalAlertsResult,
      newAlertsResult,
      criticalAlertsResult,
      correlatedAlertsResult,
      openIncidentsResult,
      resolvedIncidentsResult,
      aiAnalyzedResult,
    ] = await Promise.all([
      // Total alerts
      withOrg(supabase.from('alerts').select('id', { count: 'exact', head: true })),
      // New alerts in last 24 hours
      withOrg(supabase.from('alerts').select('id', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString())),
      // Critical alerts in last 24 hours
      withOrg(supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('severity', 'Critical').gte('created_at', yesterday.toISOString())),
      // Correlated alerts in last 24 hours
      withOrg(supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('status', 'Correlated').gte('updated_at', yesterday.toISOString())),
      // Open incidents
      withOrg(supabase.from('incidents').select('id', { count: 'exact', head: true }).in('status', ['Open', 'In Progress'])),
      // Resolved incidents in last 24 hours
      withOrg(supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('status', 'Resolved').gte('updated_at', yesterday.toISOString())),
      // AI analyzed alerts
      withOrg(supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('ai_used', true)),
    ]);

    // Get severity distribution
    const { data: severityData } = await withOrg(supabase.from('alerts').select('severity'));
    const severityCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    severityData?.forEach((a: any) => {
      severityCounts[a.severity] = (severityCounts[a.severity] || 0) + 1;
    });

    // Get top source systems
    const { data: sourceData } = await withOrg(supabase.from('alerts').select('source_system').gte('created_at', yesterday.toISOString()));
    const sourceCounts: Record<string, number> = {};
    sourceData?.forEach((a: any) => {
      sourceCounts[a.source_system] = (sourceCounts[a.source_system] || 0) + 1;
    });
    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => `${source}: ${count}`);

    const healthSummary = {
      generated_at: now.toISOString(),
      period: '24 hours',
      metrics: {
        total_alerts: totalAlertsResult.count ?? 0,
        new_alerts_24h: newAlertsResult.count ?? 0,
        critical_alerts_24h: criticalAlertsResult.count ?? 0,
        correlated_24h: correlatedAlertsResult.count ?? 0,
        open_incidents: openIncidentsResult.count ?? 0,
        resolved_24h: resolvedIncidentsResult.count ?? 0,
        ai_analyzed_total: aiAnalyzedResult.count ?? 0,
      },
      severity_distribution: severityCounts,
      top_sources_24h: topSources,
      status: determineHealthStatus(
        criticalAlertsResult.count ?? 0,
        openIncidentsResult.count ?? 0
      ),
    };

    console.log('Health Summary:', JSON.stringify(healthSummary, null, 2));

    return new Response(
      JSON.stringify(healthSummary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating health summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function determineHealthStatus(criticalAlerts: number, openIncidents: number): string {
  if (criticalAlerts > 5 || openIncidents > 10) {
    return 'CRITICAL - Immediate attention required';
  }
  if (criticalAlerts > 2 || openIncidents > 5) {
    return 'WARNING - Elevated threat level';
  }
  if (criticalAlerts > 0 || openIncidents > 2) {
    return 'ELEVATED - Monitor closely';
  }
  return 'HEALTHY - Normal operations';
}
