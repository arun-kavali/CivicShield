import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecentAISummaries } from "@/hooks/useAnalytics";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-primary text-primary-foreground",
};

export function AISummaryFeed() {
  const { data, isLoading } = useRecentAISummaries(5);
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Recent AI Summaries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="h-40 bg-muted animate-pulse rounded" />
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">AI summaries appear once incidents are analyzed</p>
        ) : (
          data.map((i: any) => (
            <button
              key={i.id}
              onClick={() => navigate(`/incidents?id=${i.id}`)}
              className="w-full text-left p-3 rounded-md border border-border hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge className={SEVERITY_COLORS[i.severity] ?? "bg-muted"}>{i.severity}</Badge>
                <span className="text-xs text-muted-foreground truncate">{i.incident_reason || "Incident"}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">{i.ai_summary}</p>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
