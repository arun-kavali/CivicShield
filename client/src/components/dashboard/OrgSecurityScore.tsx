import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import { useIncidents } from "@/hooks/useIncidents";
import { Progress } from "@/components/ui/progress";

export function OrgSecurityScore() {
  const { data: incidents, isLoading } = useIncidents();

  let score = 100;
  
  if (!isLoading && incidents) {
    const activeIncidents = incidents.filter(i => i.status !== 'Closed' && i.status !== 'Resolved');
    
    let penalty = 0;
    activeIncidents.forEach(incident => {
      if (incident.severity === 'Critical') penalty += 20;
      else if (incident.severity === 'High') penalty += 10;
      else if (incident.severity === 'Medium') penalty += 5;
      else penalty += 2;
    });
    
    score = Math.max(0, 100 - penalty);
  }

  const getScoreInfo = (s: number) => {
    if (s >= 90) return { color: "text-green-500", bg: "bg-green-500", icon: ShieldCheck, text: "Excellent" };
    if (s >= 70) return { color: "text-yellow-500", bg: "bg-yellow-500", icon: Shield, text: "Fair" };
    return { color: "text-destructive", bg: "bg-destructive", icon: ShieldAlert, text: "At Risk" };
  };

  const { color, bg, icon: Icon, text } = getScoreInfo(score);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Organization Security Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center animate-pulse bg-muted/50 rounded-md" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full bg-muted/50`}>
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
                <div>
                  <div className="text-3xl font-bold">{score}/100</div>
                  <div className={`text-sm font-medium ${color}`}>{text} Posture</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Critical Risk (0-69)</span>
                <span>Fair (70-89)</span>
                <span>Excellent (90-100)</span>
              </div>
              <Progress value={score} className="h-2" indicatorClassName={bg} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
