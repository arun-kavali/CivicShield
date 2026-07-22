import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, Plus, Database, Globe, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { ConnectorModal } from "@/components/connectors/ConnectorModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export interface ConnectorConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  isAvailable: boolean;
  comingSoon?: boolean;
}

const AVAILABLE_CONNECTORS: ConnectorConfig[] = [
  {
    id: "firebase",
    name: "Firebase Firestore",
    type: "firebase",
    description: "Ingest alerts from a Firebase Firestore collection.",
    icon: <Database className="h-6 w-6 text-[#FFCA28]" />,
    isAvailable: true,
  },
  {
    id: "rest",
    name: "REST API",
    type: "rest",
    description: "Connect generic JSON REST APIs using webhooks or polling.",
    icon: <Globe className="h-6 w-6 text-primary" />,
    isAvailable: true,
  },
  {
    id: "csv",
    name: "CSV Upload",
    type: "csv",
    description: "Manually upload and map alerts via CSV.",
    icon: <FileText className="h-6 w-6 text-emerald-500" />,
    isAvailable: true,
  },
  {
    id: "sentinel",
    name: "Microsoft Sentinel",
    type: "sentinel",
    description: "Natively integrate with Azure Sentinel alerts.",
    icon: <AlertCircle className="h-6 w-6 text-blue-500" />,
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "splunk",
    name: "Splunk",
    type: "splunk",
    description: "Ingest logs directly from Splunk Enterprise.",
    icon: <AlertCircle className="h-6 w-6 text-pink-500" />,
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "elastic",
    name: "Elastic SIEM",
    type: "elastic",
    description: "Connect to Elastic Security alerts and detections.",
    icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "chronicle",
    name: "Google Chronicle",
    type: "chronicle",
    description: "Import YARA-L rule detections from Google SecOps.",
    icon: <AlertCircle className="h-6 w-6 text-blue-400" />,
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "falcon",
    name: "CrowdStrike Falcon",
    type: "falcon",
    description: "Pull endpoint detections from CrowdStrike.",
    icon: <AlertCircle className="h-6 w-6 text-red-600" />,
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "cortex",
    name: "Palo Alto Cortex",
    type: "cortex",
    description: "XDR integration with Cortex alerts.",
    icon: <AlertCircle className="h-6 w-6 text-orange-500" />,
    isAvailable: false,
    comingSoon: true,
  },
  {
    id: "qradar",
    name: "IBM QRadar",
    type: "qradar",
    description: "IBM QRadar offense ingestion.",
    icon: <AlertCircle className="h-6 w-6 text-indigo-500" />,
    isAvailable: false,
    comingSoon: true,
  },
];

export default function Connectors() {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch active connectors from the backend API
  const { data: activeConnectors, isLoading, refetch } = useQuery({
    queryKey: ["data_connectors"],
    queryFn: async () => {
      const response = await api.get("/integrations");
      return response.data.data.integrations || [];
    },
  });

  const handleOpenConnector = (connector: ConnectorConfig) => {
    if (!connector.isAvailable) return;
    setSelectedConnector(connector);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    const endpoint = isActive ? "disable" : "enable";
    await api.post(`/integrations/${id}/${endpoint}`);
    refetch();
  };

  const handleRemove = async (id: string) => {
    if (confirm("Are you sure you want to remove this connector?")) {
      await api.delete(`/integrations/${id}`);
      refetch();
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <PageHeader 
        heading="Universal Alert Connector Hub" 
        description="Connect your organization's existing security tools and data sources."
      />

      {/* Active Configured Connectors */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configured Connectors</h3>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading connectors...</p>
        ) : activeConnectors?.length === 0 ? (
          <Card className="border-dashed bg-transparent border-muted-foreground/30">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Plug className="h-10 w-10 mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground">No Connectors Configured</p>
              <p className="text-sm max-w-sm mt-2">
                Select an available connector below to begin ingesting alerts into CivicShield.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeConnectors?.map((conn) => {
              const baseConnector = AVAILABLE_CONNECTORS.find(c => c.type === conn.integrationType);
              const isActive = conn.syncEnabled || conn.connectionStatus === "connected";
              const statusLabel = conn.connectionStatus || (conn.syncEnabled ? "active" : "inactive");
              
              return (
                <Card key={conn.id} className="relative overflow-hidden border-primary/20">
                  <div className={`absolute top-0 left-0 w-1 h-full ${isActive ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md border border-border shrink-0">
                          {baseConnector?.icon || <Plug className="h-6 w-6 text-primary" />}
                        </div>
                        <div>
                          <CardTitle className="text-base">{conn.integrationName}</CardTitle>
                          <CardDescription className="text-xs uppercase tracking-wider">{conn.integrationType}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-primary text-primary-foreground" : ""}>
                        {statusLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Records Imported:</span>
                      <span className="text-foreground font-medium">{conn.records_imported || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last Sync:</span>
                      <span className="text-foreground">{conn.last_sync ? new Date(conn.last_sync).toLocaleString() : 'Never'}</span>
                    </div>
                    {conn.error_message && (
                      <div className="bg-destructive/10 text-destructive p-2 rounded text-xs mt-2 flex items-start gap-1">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{conn.error_message}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-muted/10 gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleStatus(conn.id, isActive)}
                      className="flex-1"
                    >
                      {isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleRemove(conn.id)}
                      className="flex-none"
                    >
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Connectors */}
      <div className="space-y-4 pt-6">
        <h3 className="text-lg font-medium">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AVAILABLE_CONNECTORS.map((connector) => (
            <Card 
              key={connector.id} 
              className={`flex flex-col h-full transition-all ${connector.isAvailable ? 'hover:border-primary/50 cursor-pointer hover:shadow-md' : 'opacity-60 grayscale'}`}
              onClick={() => handleOpenConnector(connector)}
            >
              <CardHeader className="pb-2 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-muted rounded-md border border-border">
                    {connector.icon}
                  </div>
                  {connector.comingSoon && (
                    <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
                  )}
                </div>
                <CardTitle className="text-base">{connector.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {connector.description}
                </CardDescription>
              </CardHeader>
              {connector.isAvailable && (
                <CardFooter className="pt-2 pb-4">
                  <Button variant="ghost" className="w-full h-8 text-xs text-primary hover:text-primary hover:bg-primary/10">
                    <Plus className="mr-1 h-3 w-3" /> Add Connector
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>

      {selectedConnector && (
        <ConnectorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          connector={selectedConnector}
          onSuccess={() => {
            setIsModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
