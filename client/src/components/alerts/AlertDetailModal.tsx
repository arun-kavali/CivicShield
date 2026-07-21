import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/hooks/useAlerts";
import { Bot, Cpu, AlertTriangle, ShieldCheck, Lightbulb } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-primary text-primary-foreground",
};

interface AlertDetailModalProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDetailModal({ alert, open, onOpenChange }: AlertDetailModalProps) {
  if (!alert) return null;

  // Parse AI analysis sections
  const parseAnalysis = (analysis: string | null) => {
    if (!analysis) return { whatHappened: "", whyRisky: "", recommendation: "" };
    
    const whatMatch = analysis.match(/WHAT HAPPENED:\s*([\s\S]*?)(?=WHY IT'S RISKY:|$)/i);
    const whyMatch = analysis.match(/WHY IT'S RISKY:\s*([\s\S]*?)(?=RECOMMENDED ACTION:|$)/i);
    const recMatch = analysis.match(/RECOMMENDED ACTION:\s*([\s\S]*?)$/i);

    return {
      whatHappened: whatMatch?.[1]?.trim() || "",
      whyRisky: whyMatch?.[1]?.trim() || "",
      recommendation: recMatch?.[1]?.trim() || "",
    };
  };

  const analysis = parseAnalysis(alert.description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Alert Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={SEVERITY_COLORS[alert.severity]}>{alert.severity}</Badge>
            {alert.risk_score !== null && (
              <Badge variant="outline" className="border-primary">
                Risk Score: {alert.risk_score}/100
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              {alert.ai_used ? (
                <>
                  <Bot className="h-3 w-3" /> AI Analysis
                </>
              ) : (
                <>
                  <Cpu className="h-3 w-3" /> Rule-based
                </>
              )}
            </Badge>
          </div>

          {/* Alert Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Alert Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{alert.alert_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source:</span>
                <span className="font-medium">{alert.source_system}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{alert.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="font-medium">
                  {format(new Date(alert.timestamp), "PPpp")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Ago:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {alert.description && (
            <div className="space-y-3">
              {analysis.whatHappened && (
                <Card className="border-info/30 bg-info/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-info" />
                      What Happened
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.whatHappened}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.whyRisky && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-destructive" />
                      Why It's Risky
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.whyRisky}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.recommendation && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Recommended Action
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.recommendation}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Raw Log */}
          {alert.raw_log && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Raw Log Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(alert.raw_log, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
