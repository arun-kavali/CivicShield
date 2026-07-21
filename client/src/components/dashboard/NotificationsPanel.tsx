import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useIncidents } from "@/hooks/useIncidents";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-primary text-primary-foreground",
};

export function NotificationsPanel() {
  const { data: incidents, isLoading } = useIncidents(8);
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="h-40 bg-muted animate-pulse rounded" />
        ) : !incidents || incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No new notifications</p>
        ) : (
          incidents.map((i) => (
            <button
              key={i.id}
              onClick={() => navigate(`/incidents?id=${i.id}`)}
              className="w-full text-left flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <ShieldAlert className="h-4 w-4 text-destructive shrink-0 mt-1" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={SEVERITY_COLORS[i.severity] ?? "bg-muted"}>{i.severity}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium truncate mt-1">{(i as any).incident_reason || "Incident"}</p>
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
