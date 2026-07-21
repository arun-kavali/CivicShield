import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Target, Building, Flag, Shield, Lightbulb, AlertCircle, 
  Activity, Clock, Hash, Fingerprint, Crosshair, ChevronRight 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AIIncidentSummaryProps {
  summary: string;
  isAIUsed?: boolean;
}

interface ParsedSummary {
  executiveSummary: string;
  technicalSummary: string;
  businessImpact: string;
  riskExplanation: string;
  recommendedActions: string;
  containmentStrategy: string;
  recoveryStrategy: string;
  confidenceScore: number;
  confidenceReasoning: string;
  mitreAttack: Array<{ tactic: string; technique: string }>;
  attackTimeline: Array<{ stage: string; description: string }>;
  extractedIOCs: Record<string, string[]>;
  threatActorPrediction: { profile: string; reasoning: string };
  isRuleBased: boolean;
}

function parseSummary(summary: string): ParsedSummary {
  // Default structure
  const sections: ParsedSummary = {
    executiveSummary: "",
    technicalSummary: "",
    businessImpact: "",
    riskExplanation: "",
    recommendedActions: "",
    containmentStrategy: "",
    recoveryStrategy: "",
    confidenceScore: 0,
    confidenceReasoning: "",
    mitreAttack: [],
    attackTimeline: [],
    extractedIOCs: {},
    threatActorPrediction: { profile: "", reasoning: "" },
    isRuleBased: summary.includes("Rule-based fallback analysis"),
  };

  try {
    // Try to extract JSON from markdown block
    const jsonMatch = summary.match(/```json\n([\s\S]*?)\n```/i);
    let jsonStr = summary;
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1];
    } else if (summary.trim().startsWith('{')) {
      jsonStr = summary; // It might just be raw JSON
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Merge parsed data into default structure safely
    return { ...sections, ...parsed, isRuleBased: parsed.isRuleBased || sections.isRuleBased };
  } catch (error) {
    console.error("Failed to parse AI summary JSON:", error);
    // Fallback if parsing fails but we still have text
    sections.executiveSummary = "Failed to parse structured intelligence. Raw response below.";
    sections.technicalSummary = summary;
    return sections;
  }
}

function getConfidenceColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function AIIncidentSummary({ summary, isAIUsed = true }: AIIncidentSummaryProps) {
  const parsed = parseSummary(summary);
  const isRuleBased = parsed.isRuleBased || !isAIUsed;

  return (
    <div className="space-y-4">
      {/* Header & Confidence Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              AI Incident Intelligence
              <Badge variant="secondary" className="text-xs">v2.0</Badge>
            </h3>
            {isRuleBased && (
              <span className="text-xs text-warning flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                AI unavailable – fallback mode
              </span>
            )}
          </div>
        </div>

        {/* Confidence Score Display */}
        <div className="flex flex-col items-end gap-1 w-full sm:w-auto min-w-[200px]">
          <div className="flex justify-between w-full text-sm font-medium">
            <span>AI Confidence Score</span>
            <span>{parsed.confidenceScore}%</span>
          </div>
          <Progress 
            value={parsed.confidenceScore} 
            className="h-2 w-full"
            indicatorClassName={getConfidenceColor(parsed.confidenceScore)}
          />
          <span className="text-xs text-muted-foreground truncate max-w-xs" title={parsed.confidenceReasoning}>
            {parsed.confidenceReasoning}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Executive Summary */}
        <Card className="col-span-1 md:col-span-2 border-primary/20 shadow-sm">
          <CardHeader className="pb-2 pt-4 bg-primary/5">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-foreground/90">{parsed.executiveSummary}</p>
          </CardContent>
        </Card>

        {/* Technical Summary */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-info" />
              Technical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{parsed.technicalSummary}</p>
          </CardContent>
        </Card>

        {/* Business Impact & Risk */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4 text-warning" />
              Business Impact & Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <div>
              <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Impact</span>
              <p className="text-sm text-foreground/90">{parsed.businessImpact}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Risk</span>
              <p className="text-sm text-foreground/90">{parsed.riskExplanation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MITRE ATT&CK Mapping */}
      {parsed.mitreAttack && parsed.mitreAttack.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2 pt-4 bg-muted/10">
            <CardTitle className="text-sm flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-destructive" />
              MITRE ATT&CK Mapping
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {parsed.mitreAttack.map((mitre, idx) => (
                <Badge key={idx} variant="outline" className="bg-background border-destructive/30 text-destructive-foreground font-mono text-xs py-1">
                  {mitre.tactic}: {mitre.technique}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attack Timeline */}
      {parsed.attackTimeline && parsed.attackTimeline.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Attack Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <div className="relative border-l border-muted ml-3 space-y-4">
              {parsed.attackTimeline.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                  <div className="text-sm font-semibold">{item.stage}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* IOCs */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Hash className="h-4 w-4 text-info" />
              Extracted IOCs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {Object.entries(parsed.extractedIOCs || {}).map(([type, items]) => {
              if (!items || items.length === 0) return null;
              return (
                <div key={type} className="mb-3 last:mb-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{type}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {items.map((ioc, idx) => (
                      <Badge key={idx} variant="secondary" className="font-mono text-xs">{ioc}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
            {(!parsed.extractedIOCs || Object.values(parsed.extractedIOCs).flat().length === 0) && (
              <p className="text-sm text-muted-foreground italic">No specific IOCs extracted.</p>
            )}
          </CardContent>
        </Card>

        {/* Threat Actor Prediction */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-warning" />
              Threat Actor Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-2">
            <p className="text-sm font-medium text-foreground">{parsed.threatActorPrediction?.profile || "Unknown Profile"}</p>
            <p className="text-xs text-muted-foreground">{parsed.threatActorPrediction?.reasoning || "Insufficient data for profiling."}</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategies & Actions */}
      <Card className="border-info/20">
        <CardHeader className="pb-2 pt-4 bg-info/5">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-info" />
            Response Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1 mb-1">
              <ChevronRight className="h-4 w-4 text-info" />
              Containment Steps
            </h4>
            <div className="text-sm text-foreground/90 pl-5 whitespace-pre-wrap">{parsed.containmentStrategy}</div>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1 mb-1">
              <ChevronRight className="h-4 w-4 text-info" />
              Recovery Plan
            </h4>
            <div className="text-sm text-foreground/90 pl-5 whitespace-pre-wrap">{parsed.recoveryStrategy}</div>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-1 mb-1">
              <Lightbulb className="h-4 w-4 text-warning" />
              Analyst Recommendations
            </h4>
            <div className="text-sm text-foreground/90 pl-5 whitespace-pre-wrap">{parsed.recommendedActions}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
