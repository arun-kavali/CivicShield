import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer, TrendingUp, ShieldAlert, Activity, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const REPORT_TYPES = [
  {
    id: "executive",
    title: "Executive Summary",
    description: "High-level overview of organizational risk, business impact, and total incidents.",
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
  },
  {
    id: "incident",
    title: "Incident Report",
    description: "Detailed breakdown of all resolved and open incidents in the current period.",
    icon: <ShieldAlert className="h-6 w-6 text-destructive" />,
  },
  {
    id: "threat-intel",
    title: "Threat Intelligence Report",
    description: "Analysis of MITRE ATT&CK techniques, indicators of compromise, and top attack sources.",
    icon: <Activity className="h-6 w-6 text-warning" />,
  },
  {
    id: "monthly-soc",
    title: "Monthly SOC Report",
    description: "Comprehensive Security Operations Center metrics, MTTR, and alert volume trends.",
    icon: <FileCheck2 className="h-6 w-6 text-emerald-500" />,
  }
];

export default function Reports() {
  const { organization } = useAuth();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (id: string, title: string) => {
    setGenerating(id);
    toast.info(`Generating ${title}...`, {
      description: "Compiling data from your organization's incidents."
    });
    
    // Simulate generation delay
    setTimeout(() => {
      setGenerating(null);
      toast.success(`${title} generated successfully!`, {
        description: "Ready for PDF export.",
        action: {
          label: "Export PDF",
          onClick: () => window.print()
        }
      });
    }, 1500);
  };

  const handleExportPDF = () => {
    toast.info("Preparing PDF export...");
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="print:hidden">
        <PageHeader
          heading="Security Reports"
          description="Generate and export automated AI-driven security reports for your organization."
        />
      </div>

      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-xl font-semibold tracking-tight">Available Reports</h2>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Export All to PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
        {REPORT_TYPES.map((report) => (
          <Card key={report.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="p-2 bg-muted rounded-md shrink-0">
                {report.icon}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-dashed">
                <p><strong>Organization:</strong> {organization?.name || "Loading..."}</p>
                <p><strong>Period:</strong> Last 30 Days</p>
                <p><strong>Data Sources:</strong> Alerts, AI Analysis, SOC Metrics</p>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t print:hidden">
              <Button 
                variant="default" 
                className="w-full gap-2" 
                onClick={() => handleGenerate(report.id, report.title)}
                disabled={generating !== null}
              >
                {generating === report.id ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Print-only section */}
      <div className="hidden print:block space-y-8 pt-8">
        <div className="text-center pb-8 border-b">
          <h1 className="text-3xl font-bold mb-2">CivicShield AI Security Report</h1>
          <p className="text-xl text-muted-foreground">Organization: {organization?.name}</p>
          <p className="text-sm text-muted-foreground mt-4">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-2 border-b pb-1">Incident Summary</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm mt-4">
              <li>Total Alerts Processed: <strong>1,245</strong></li>
              <li>Incidents Generated: <strong>12</strong></li>
              <li>Critical Incidents: <strong>2</strong></li>
              <li>Mean Time To Resolve: <strong>4.2 hours</strong></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 border-b pb-1">Threat Landscape</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm mt-4">
              <li>Top Attack Vector: <strong>Brute Force</strong></li>
              <li>Top Targeted Asset: <strong>Production Database</strong></li>
              <li>Mitigated Threats: <strong>100%</strong></li>
              <li>Active Campaigns: <strong>0</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
