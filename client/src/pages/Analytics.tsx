import { AlertTriangle, FileWarning, CheckCircle, Activity } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { AlertsTimelineChart } from "@/components/dashboard/AlertsTimelineChart";
import { IncidentStatusChart } from "@/components/dashboard/IncidentStatusChart";
import { SourceChart } from "@/components/dashboard/SourceChart";
import { OrgSecurityScore } from "@/components/dashboard/OrgSecurityScore";
import { ConnectorHealth } from "@/components/dashboard/ConnectorHealth";
import { RiskTrendChart } from "@/components/dashboard/RiskTrendChart";
import { AttackTrendsChart } from "@/components/dashboard/AttackTrendsChart";
import { PeriodicAlertsChart } from "@/components/dashboard/PeriodicAlertsChart";
import { useAnalyticsSummary } from "@/hooks/useAnalytics";
import { useRealtimeIncidents } from "@/hooks/useRealtimeIncidents";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";

export default function Analytics() {
  useRealtimeIncidents();
  useRealtimeAlerts();
  const { data: summary, isLoading } = useAnalyticsSummary();
  const openVsResolved =
    summary && summary.resolvedIncidents + summary.closedIncidents + summary.openIncidents > 0
      ? Math.round(
          ((summary.resolvedIncidents + summary.closedIncidents) /
            (summary.resolvedIncidents + summary.closedIncidents + summary.openIncidents)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Security metrics and trends powered by live Supabase data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Alerts" value={summary?.totalAlerts ?? 0} icon={AlertTriangle} color="text-warning" bgColor="bg-warning/10" isLoading={isLoading} />
        <StatsCard title="Total Incidents" value={summary?.totalIncidents ?? 0} icon={FileWarning} color="text-info" bgColor="bg-info/10" isLoading={isLoading} />
        <StatsCard title="Open Incidents" value={summary?.openIncidents ?? 0} icon={Activity} color="text-destructive" bgColor="bg-destructive/10" isLoading={isLoading} />
        <StatsCard title="Resolved %" value={`${openVsResolved}%`} icon={CheckCircle} color="text-primary" bgColor="bg-primary/10" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrgSecurityScore />
        <ConnectorHealth />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskTrendChart />
        <AttackTrendsChart />
      </div>

      <PeriodicAlertsChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsTimelineChart />
        <SeverityChart />
        <IncidentStatusChart />
        <SourceChart />
      </div>
    </div>
  );
}
