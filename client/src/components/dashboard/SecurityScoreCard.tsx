import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function SecurityScoreCard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  // Basic heuristic: start at 100, subtract for open criticals and high alerts
  const baseScore = 100;
  const criticalPenalty = (stats?.criticalAlerts || 0) * 5;
  const highPenalty = (stats?.totalAlerts || 0) > (stats?.criticalAlerts || 0) ? 2 : 0; // rough heuristic
  
  const score = Math.max(0, baseScore - criticalPenalty - highPenalty);
  
  let colorClass = "text-primary";
  if (score < 70) colorClass = "text-warning";
  if (score < 50) colorClass = "text-destructive";

  return (
    <Card className="border-primary/20 shadow-sm relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Organization Security Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
            <span className="text-muted-foreground text-sm ml-1">/ 100</span>
          </div>
          <div className="flex flex-col items-end">
            <div className={`flex items-center text-xs ${score > 80 ? 'text-primary' : 'text-destructive'}`}>
              {score > 80 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {score > 80 ? '+2% from last week' : '-5% from last week'}
            </div>
          </div>
        </div>
        <div className="w-full bg-muted mt-4 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full ${score >= 80 ? 'bg-primary' : score >= 50 ? 'bg-warning' : 'bg-destructive'} transition-all duration-1000 ease-in-out`}
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
