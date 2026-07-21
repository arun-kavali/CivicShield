import { useState } from "react";
import { Shield, Send, Loader2, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type AlertSeverity = "Low" | "Medium" | "High" | "Critical";

interface AlertFormData {
  source_system: string;
  alert_type: string;
  severity: AlertSeverity;
  raw_log: string;
}

const initialFormData: AlertFormData = {
  source_system: "",
  alert_type: "",
  severity: "Medium",
  raw_log: "",
};

// Sample alert templates for demo generation
const SAMPLE_ALERT_TYPES = [
  {
    alert_type: "Brute Force Login Attempt",
    source_system: "Authentication System",
    generateLog: () => ({
      source_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      affected_user: `user${Math.floor(Math.random() * 1000)}@company.com`,
      failed_attempts: Math.floor(Math.random() * 50) + 10,
      message: "Multiple failed login attempts detected from single IP",
    }),
  },
  {
    alert_type: "Phishing Email Detected",
    source_system: "Email Gateway",
    generateLog: () => ({
      source_ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      affected_user: `employee${Math.floor(Math.random() * 500)}@company.com`,
      sender: `suspicious${Math.floor(Math.random() * 100)}@malicious-domain.com`,
      subject: "Urgent: Action Required - Account Verification",
      message: "Suspicious email with known phishing indicators blocked",
    }),
  },
  {
    alert_type: "Malware Detection",
    source_system: "EDR",
    generateLog: () => ({
      source_ip: `172.16.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      affected_system: `WORKSTATION-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
      malware_type: ["Trojan", "Ransomware", "Spyware", "Worm"][Math.floor(Math.random() * 4)],
      file_path: `C:\\Users\\user\\Downloads\\suspicious_file_${Math.floor(Math.random() * 100)}.exe`,
      message: "Malicious file detected and quarantined",
    }),
  },
  {
    alert_type: "Suspicious Login",
    source_system: "Cloud IAM",
    generateLog: () => ({
      source_ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      affected_user: `admin${Math.floor(Math.random() * 50)}@company.com`,
      location: ["Russia", "China", "North Korea", "Unknown VPN"][Math.floor(Math.random() * 4)],
      device: "Unknown Device",
      message: "Login from unusual location or device detected",
    }),
  },
  {
    alert_type: "Port Scanning Activity",
    source_system: "Firewall",
    generateLog: () => ({
      source_ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      affected_system: `SERVER-${["WEB", "DB", "APP", "FILE"][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 10)}`,
      ports_scanned: Math.floor(Math.random() * 1000) + 100,
      scan_type: ["SYN", "FIN", "XMAS", "NULL"][Math.floor(Math.random() * 4)],
      message: "Network reconnaissance activity detected",
    }),
  },
];

const SEVERITIES: AlertSeverity[] = ["Low", "Medium", "High", "Critical"];

export default function AlertSourceDashboard() {
  const { user, organization, signOut } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<AlertFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{ id: string; timestamp: string } | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSampleAlerts = async () => {
    if (!organization) {
      toast({
        variant: "destructive",
        title: "No Organization",
        description: "You must select an organization before generating alerts.",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate 5 random alerts
      const alertsToInsert = [];
      for (let i = 0; i < 5; i++) {
        const template = SAMPLE_ALERT_TYPES[Math.floor(Math.random() * SAMPLE_ALERT_TYPES.length)];
        const severity = SEVERITIES[Math.floor(Math.random() * 3)]; // Low, Medium, High (no Critical for samples)
        
        alertsToInsert.push({
          organization_id: organization.id,
          source_system: template.source_system,
          alert_type: template.alert_type,
          severity,
          raw_log: template.generateLog(),
          status: "New" as const,
          timestamp: new Date().toISOString(),
        });
      }

      const insertPromises = alertsToInsert.map((alert) => api.post("/api/alerts", alert));
      await Promise.all(insertPromises);

      toast({
        title: "Sample Alerts Generated",
        description: "5 alerts have been injected and will be automatically processed by AI.",
      });
    } catch (error: unknown) {
      console.error("Error generating sample alerts:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate sample alerts.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organization) {
      toast({
        variant: "destructive",
        title: "No Organization",
        description: "You must select an organization before submitting alerts.",
      });
      return;
    }

    if (!formData.source_system.trim() || !formData.alert_type.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Source and Type are required.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse raw_data as JSON if provided
      let parsedRawLog = null;
      if (formData.raw_log.trim()) {
        try {
          parsedRawLog = JSON.parse(formData.raw_log);
        } catch {
          // If not valid JSON, store as message object
          parsedRawLog = { message: formData.raw_log };
        }
      }

      const response = await api.post("/api/alerts", {
        organization_id: organization.id,
        source_system: formData.source_system.trim(),
        alert_type: formData.alert_type.trim(),
        severity: formData.severity,
        raw_log: parsedRawLog,
        status: "New",
        timestamp: new Date().toISOString(),
      });

      const data = response.data.data;

      setLastSubmission({
        id: data.alert?.id || response.data.data.alert.id,
        timestamp: new Date(data.alert?.timestamp || response.data.data.alert.timestamp).toLocaleString(),
      });

      toast({
        title: "Alert Submitted",
        description: "Your alert has been submitted and will be processed automatically.",
      });

      // Reset form
      setFormData(initialFormData);
    } catch (error: unknown) {
      console.error("Error submitting alert:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit alert.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">CivicShield</h1>
              <p className="text-xs text-muted-foreground">Alert Source Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Submit Security Alert
            </CardTitle>
            <CardDescription>
              Submit alerts to the CivicShield Defense Team for automated analysis and correlation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source System *</Label>
                  <Input 
                    id="source" 
                    placeholder="e.g. AWS CloudTrail, CrowdStrike Falcon" 
                    value={formData.source_system}
                    onChange={(e) => setFormData({ ...formData, source_system: e.target.value })}
                    required
                    className="bg-[#1e2330] border-[#2a2f3a]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Alert Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Excessive Failed Logins, Malware Dropper Detected" 
                    value={formData.alert_type}
                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                    required
                    className="bg-[#1e2330] border-[#2a2f3a]"
                  />
                </div>
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: AlertSeverity) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Raw Log Data */}
              <div className="space-y-2">
                <Label htmlFor="raw_data">Raw Log Data (Optional)</Label>
                <Textarea 
                  id="raw_data" 
                  placeholder="{&#10;  &quot;event_id&quot;: &quot;...&quot;,&#10;  &quot;ip_address&quot;: &quot;...&quot;&#10;}" 
                  value={formData.raw_log}
                  onChange={(e) => setFormData({ ...formData, raw_log: e.target.value })}
                  className="bg-[#1e2330] border-[#2a2f3a] font-mono text-sm h-32"
                />
                <p className="text-xs text-muted-foreground">
                  Enter JSON data or plain text. Plain text will be wrapped in a message object.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Alert
                  </>
                )}
              </Button>
            </form>

            {/* Last Submission Confirmation */}
            {lastSubmission && (
              <div className="mt-6 p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 text-primary font-medium mb-2">
                  <CheckCircle className="h-5 w-5" />
                  Alert Submitted Successfully
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Alert ID:</strong> {lastSubmission.id}</p>
                  <p><strong>Submitted:</strong> {lastSubmission.timestamp}</p>
                  <p className="text-xs mt-2 italic">
                    This alert will be automatically analyzed and correlated by the AI system.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo / Alert Injection Controls */}
        <Card className="mt-6 border-dashed border-2 border-primary/40 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-primary" />
              Demo / Alert Injection Controls
            </CardTitle>
            <CardDescription className="text-xs">
              Generate sample alerts for demo and testing purposes. Simulates alerts from external systems (SIEM, EDR, Email Gateway).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateSampleAlerts}
              disabled={isGenerating}
              variant="outline"
              className="w-full border-primary/50 hover:bg-primary/10"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate 5 Sample Alerts
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Alerts will be automatically analyzed by AI and correlated into incidents.
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-muted/30 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">About Alert Processing</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Submitted alerts are automatically analyzed by AI</li>
                  <li>Risk scores and severity are calculated automatically</li>
                  <li>Related alerts are correlated into incidents</li>
                  <li>Defense Analysts are notified of critical alerts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
