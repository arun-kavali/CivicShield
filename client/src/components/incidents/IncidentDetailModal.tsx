import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Incident, useIncidentAlerts } from "@/hooks/useIncidents";
import { useIncidentSummary } from "@/hooks/useIncidentSummary";
import { FileWarning, Zap, Bot, Cpu, AlertTriangle, Network, Loader2, Download, Printer } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { AIIncidentSummary } from "./AIIncidentSummary";
import { IncidentActionPanel } from "./IncidentActionPanel";
import { IncidentActivityTimeline } from "./IncidentActivityTimeline";
import { InvestigationChat } from "./InvestigationChat";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "bg-destructive text-destructive-foreground",
  High: "bg-orange-500 text-white",
  Medium: "bg-yellow-500 text-black",
  Low: "bg-primary text-primary-foreground",
};

const STATUS_COLORS: Record<string, string> = {
  Open: "bg-destructive/20 text-destructive border-destructive",
  "In Progress": "bg-yellow-500/20 text-yellow-700 border-yellow-500",
  Resolved: "bg-primary/20 text-primary border-primary",
  Closed: "bg-muted text-muted-foreground border-muted",
};

interface IncidentDetailModalProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function extractIP(rawLog: unknown): string {
  if (!rawLog || typeof rawLog !== "object") return "N/A";
  const log = rawLog as Record<string, unknown>;
  return (log.source_ip as string) || (log.ip as string) || (log.ip_address as string) || "N/A";
}

export function IncidentDetailModal({ incident, open, onOpenChange }: IncidentDetailModalProps) {
  const { data: correlatedAlerts, isLoading: alertsLoading } = useIncidentAlerts(incident?.id || "");
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [localStatus, setLocalStatus] = useState(incident?.status || "Open");
  const [activeTab, setActiveTab] = useState("overview");
  
  const { summary, isLoading: summaryLoading, isAIUsed, error: summaryError, generateSummary } = useIncidentSummary(
    incident?.id, 
    incident?.ai_summary
  );

  const isAnalyst = role === "analyst";

  const hasStructuredFormat = (text: string | null | undefined) => {
    return text && 
      text.includes("executiveSummary") && 
      text.includes("businessImpact");
  };

  useEffect(() => {
    if (!incident || !open || !isAnalyst) return;
    
    setLocalStatus(incident.status);
    
    const existingSummary = summary || incident.ai_summary;
    const needsSummary = !hasStructuredFormat(existingSummary);
    const isInvestigating = incident.status === "In Progress" || incident.status === "Resolved" || incident.status === "Closed";
    
    if (needsSummary && isInvestigating && !summaryLoading) {
      console.log("Auto-triggering AI summary generation for incident:", incident.id);
      generateSummary(incident.id);
    }
  }, [incident, open, isAnalyst, summary, summaryLoading, generateSummary]);

  if (!incident) return null;

  const handleStatusChange = async () => {
    setLocalStatus("In Progress");
    setActiveTab("intelligence");
    
    if (!incident.ai_summary && !summary) {
      await generateSummary(incident.id);
    }
    
    queryClient.invalidateQueries({ queryKey: ["incidents"] });
  };

  const handleResolved = () => {
    setLocalStatus("Resolved");
    queryClient.invalidateQueries({ queryKey: ["incidents"] });
  };
  
  const handlePrint = () => {
    toast.info("Generating Incident Report (PDF)... Use your browser's Print dialog to save as PDF.", {
      duration: 5000,
      icon: <Printer className="h-4 w-4" />
    });
    setTimeout(() => window.print(), 500);
  };

  const displaySummary = summary || incident.ai_summary;
  const hasValidSummary = hasStructuredFormat(displaySummary);
  const showAISummary = isAnalyst && (localStatus === "In Progress" || localStatus === "Resolved" || localStatus === "Closed");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0" aria-describedby="incident-description">
        
        {/* Print-only wrapper class used if we were to isolate it, but we'll rely on global print media queries mostly */}
        <div ref={printRef} className="flex flex-col h-full overflow-hidden">
          
          <div className="px-6 py-4 border-b shrink-0 flex items-start justify-between bg-background">
            <DialogHeader className="text-left">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <FileWarning className="h-6 w-6 text-info" />
                Incident Investigation
              </DialogTitle>
              <DialogDescription id="incident-description">
                AI-powered analysis, containment, and response platform.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex print:hidden">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="px-6 py-3 border-b shrink-0 bg-muted/10 print:hidden flex flex-wrap items-center gap-3">
            <Badge className={SEVERITY_COLORS[incident.severity]}>{incident.severity}</Badge>
            <Badge variant="outline" className={STATUS_COLORS[localStatus]}>{localStatus}</Badge>
            {incident.auto_created && (
              <Badge variant="outline" className="flex items-center gap-1 border-primary">
                <Zap className="h-3 w-3" /> Auto-created
              </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-auto">
              Created: {format(new Date(incident.created_at), "PPpp")}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-background">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="w-full justify-start border-b rounded-none px-0 bg-transparent h-auto mb-6 shrink-0 print:hidden">
                <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent">
                  Overview
                </TabsTrigger>
                {isAnalyst && (
                  <TabsTrigger value="intelligence" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI Intelligence
                  </TabsTrigger>
                )}
                {isAnalyst && (
                  <TabsTrigger value="chat" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 bg-transparent">
                    Investigation Chat
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="flex-1 min-h-0">
                <TabsContent value="overview" className="m-0 space-y-6">
                  {isAnalyst && localStatus === "Open" && (
                    <Card className="border-info/30 bg-info/5 print:hidden">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                          <Bot className="h-5 w-5 text-info" />
                          <div className="text-sm text-foreground">
                            Click <strong>"Start Investigation"</strong> below to generate a comprehensive AI Incident Report, extract IOCs, and map to MITRE ATT&CK.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            Correlated Alerts ({correlatedAlerts?.length || 0})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {alertsLoading ? (
                            <div className="space-y-2">
                              {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                              ))}
                            </div>
                          ) : !correlatedAlerts || correlatedAlerts.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No correlated alerts found</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>
                                      <div className="flex items-center gap-1">
                                        <Network className="h-3 w-3" />
                                        IP
                                      </div>
                                    </TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>AI</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {correlatedAlerts.map((alert) => (
                                    <TableRow key={alert.id}>
                                      <TableCell className="font-medium">{alert.alert_type}</TableCell>
                                      <TableCell className="text-muted-foreground">
                                        {alert.source_system}
                                      </TableCell>
                                      <TableCell className="font-mono text-xs">
                                        {extractIP(alert.raw_log)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge className={SEVERITY_COLORS[alert.severity]} variant="secondary">
                                          {alert.severity}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-muted-foreground text-sm">
                                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                                      </TableCell>
                                      <TableCell>
                                        {alert.ai_used ? (
                                          <Bot className="h-4 w-4 text-primary" />
                                        ) : (
                                          <Cpu className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {isAnalyst && (
                        <IncidentActivityTimeline incidentId={incident.id} />
                      )}
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <span className="text-muted-foreground block mb-1">Reason:</span>
                            <span className="font-medium">{incident.incident_reason || "Unknown"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-1">Last Updated:</span>
                            <span className="font-medium">{formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true })}</span>
                          </div>
                          {incident.resolved_at && (
                            <div>
                              <span className="text-muted-foreground block mb-1">Resolved At:</span>
                              <span className="font-medium text-primary">{format(new Date(incident.resolved_at), "PPpp")}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {isAnalyst && (
                        <IncidentActionPanel
                          incidentId={incident.id}
                          incidentStatus={localStatus}
                          onResolved={handleResolved}
                          onStatusChange={handleStatusChange}
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>

                {isAnalyst && (
                  <TabsContent value="intelligence" className="m-0 space-y-4">
                    {summaryLoading ? (
                      <Card className="border-primary/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            Generating AI Incident Intelligence...
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Skeleton className="h-32 w-full rounded-lg" />
                          <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-40 w-full rounded-lg" />
                            <Skeleton className="h-40 w-full rounded-lg" />
                          </div>
                        </CardContent>
                      </Card>
                    ) : hasValidSummary && displaySummary ? (
                      <AIIncidentSummary summary={displaySummary} isAIUsed={isAIUsed} />
                    ) : summaryError ? (
                      <Card className="border-destructive/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            Failed to Generate Intelligence
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{summaryError}</p>
                          <Button 
                            variant="outline"
                            onClick={() => generateSummary(incident.id)}
                            className="text-primary border-primary hover:bg-primary/10"
                          >
                            Retry Generation
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Bot className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Investigation Not Started</p>
                        <p className="text-sm">Start the investigation from the Overview tab to generate AI Intelligence.</p>
                      </div>
                    )}
                  </TabsContent>
                )}

                {isAnalyst && (
                  <TabsContent value="chat" className="m-0 h-full">
                    {showAISummary ? (
                      <InvestigationChat incidentId={incident.id} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                        <Bot className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Chat Unavailable</p>
                        <p className="text-sm">Please start the investigation to enable AI Chat.</p>
                      </div>
                    )}
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
