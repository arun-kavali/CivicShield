import { Shield, AlertTriangle, FileWarning, CheckCircle } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRealtimeIncidents } from "@/hooks/useRealtimeIncidents";
import { useRealtimeAlerts } from "@/hooks/useRealtimeAlerts";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AlertsTimelineChart } from "@/components/dashboard/AlertsTimelineChart";
import { RecentAlertsTable } from "@/components/dashboard/RecentAlertsTable";
import { ActiveIncidentsTable } from "@/components/dashboard/ActiveIncidentsTable";
import { SecurityScoreCard } from "@/components/dashboard/SecurityScoreCard";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { AssignedInvestigations } from "@/components/dashboard/AssignedInvestigations";
import { AISummaryFeed } from "@/components/dashboard/AISummaryFeed";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  useRealtimeIncidents();
  useRealtimeAlerts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security Analyst Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of your security posture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Live Alerts" value={stats?.totalAlerts ?? 0} icon={AlertTriangle} color="text-warning" bgColor="bg-warning/10" isLoading={isLoading} />
        <StatsCard title="Critical Alerts" value={stats?.criticalAlerts ?? 0} icon={Shield} color="text-destructive" bgColor="bg-destructive/10" isLoading={isLoading} />
        <StatsCard title="Open Incidents" value={stats?.openIncidents ?? 0} icon={FileWarning} color="text-info" bgColor="bg-info/10" isLoading={isLoading} />
        <StatsCard title="Resolved Today" value={stats?.resolvedToday ?? 0} icon={CheckCircle} color="text-primary" bgColor="bg-primary/10" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AlertsTimelineChart />
          <RecentAlertsTable />
        </div>
        <div className="space-y-6">
          <SecurityScoreCard />
          <NotificationsPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignedInvestigations />
        <AISummaryFeed />
      </div>

      <ActiveIncidentsTable />
    </div>
  );
}
