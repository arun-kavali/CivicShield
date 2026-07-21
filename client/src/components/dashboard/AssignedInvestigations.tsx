import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useActiveIncidents } from "@/hooks/useIncidents";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-primary text-primary-foreground",
};

export function AssignedInvestigations() {
  const { data, isLoading } = useActiveIncidents(6);
  const navigate = useNavigate();
  const inProgress = (data ?? []).filter((i) => i.status === "In Progress");
  const list = inProgress.length ? inProgress : data ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" /> Assigned Investigations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 bg-muted animate-pulse rounded" />
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No active investigations</p>
        ) : (
          <ul className="space-y-2">
            {list.map((i) => (
              <li key={i.id}>
                <button
                  onClick={() => navigate(`/incidents?id=${i.id}`)}
                  className="w-full text-left flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{(i as any).incident_reason || "Incident"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(i.created_at), { addSuffix: true })} · {i.status}
                    </p>
                  </div>
                  <Badge className={SEVERITY_COLORS[i.severity] ?? "bg-muted"}>{i.severity}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
