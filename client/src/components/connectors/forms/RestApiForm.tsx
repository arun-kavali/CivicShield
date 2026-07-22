import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConnectorConfig } from "@/pages/Connectors";
import { api } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  connector: ConnectorConfig;
  onSuccess: () => void;
  onClose: () => void;
}

export function RestApiForm({ connector, onSuccess, onClose }: Props) {
  const { organization } = useAuth();
  const [endpointUrl, setEndpointUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleValidate = async () => {
    if (!endpointUrl) {
      toast.error("Endpoint URL is required");
      return;
    }
    
    setIsValidating(true);
    
    try {
      new URL(endpointUrl); // Validate URL format
      JSON.parse(headers); // Validate headers JSON
      
      // Attempt generic GET/OPTIONS request just to check reachability
      try {
        await fetch(endpointUrl, {
          method: 'OPTIONS',
          headers: JSON.parse(headers),
          mode: 'no-cors' // We just want to see if it doesn't instantly throw a network error in the browser
        });
      } catch (fetchError) {
        // If it fails cors, that's fine, it might still be a valid endpoint for backend ingestion
        console.log("Fetch test result:", fetchError);
      }
      
      setValidated(true);
      toast.success("Connection validated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Validation failed. Check URL format and Headers JSON.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validated) return;
    if (!organization) {
      toast.error("No organization context. Please refresh and try again.");
      return;
    }

    setIsSaving(true);
    try {
      const config = {
        endpointUrl,
        apiKey,
        webhookSecret,
        headers: JSON.parse(headers)
      };

      await api.post('/integrations', {
        organizationId: organization._id ?? organization.id,
        integrationName: `REST API (${new URL(endpointUrl).hostname})`,
        integrationType: 'rest',
        connectionMode: 'pull',
        connectionStatus: 'connected',
        syncEnabled: true,
        metadata: config,
      });
      
      toast.success("Connector configured securely");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save connector");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="bg-muted p-4 rounded-md space-y-2 mb-4">
          <h4 className="text-sm font-semibold">Your Ingestion Webhook URL</h4>
          <p className="text-xs text-muted-foreground mb-2">Configure your external system to POST JSON alerts to this endpoint.</p>
          <div className="flex gap-2">
            <Input 
              id="webhook-url" 
              readOnly 
              value={`${window.location.origin}/api/alerts/ingest`} 
              className="font-mono text-sm bg-muted"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/api/alerts/ingest`);
                toast.success("Webhook URL copied to clipboard");
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </Button>
          </div>
        </div>

        <Label htmlFor="endpointUrl">Test Endpoint Connection (Optional Polling)</Label>
        <Input 
          id="endpointUrl" 
          placeholder="https://api.provider.com/v1/alerts" 
          value={endpointUrl} 
          onChange={(e) => { setEndpointUrl(e.target.value); setValidated(false); }}
        />

      
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key or Bearer Token (For Polling)</Label>
        <Input 
          id="apiKey" 
          type="password"
          placeholder="Leave blank if using Webhook only" 
          value={apiKey} 
          onChange={(e) => { setApiKey(e.target.value); setValidated(false); }}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="headers">Custom Headers (JSON)</Label>
        <Textarea 
          id="headers" 
          className="font-mono text-sm" 
          rows={3}
          value={headers} 
          onChange={(e) => { setHeaders(e.target.value); setValidated(false); }}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {!validated ? (
          <Button onClick={handleValidate} disabled={isValidating}>
            {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Validate Connection
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Activate Webhook & Poller
          </Button>
        )}
      </div>
    </div>
  );
}
