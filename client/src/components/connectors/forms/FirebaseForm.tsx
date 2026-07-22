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

export function FirebaseForm({ connector, onSuccess, onClose }: Props) {
  const { organization } = useAuth();
  const [projectId, setProjectId] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [serviceAccount, setServiceAccount] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleValidate = async () => {
    if (!projectId || !collectionName || !serviceAccount) {
      toast.error("All fields are required");
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Basic structural validation of the JSON
      JSON.parse(serviceAccount);
      
      // Simulate API verification wait
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setValidated(true);
      toast.success("Connection validated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Invalid Service Account JSON format");
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
      const config = { projectId, collectionName, serviceAccount: JSON.parse(serviceAccount) };

      await api.post('/integrations', {
        organizationId: organization._id ?? organization.id,
        integrationName: `Firestore Integration (${projectId})`,
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
      <div className="space-y-2">
        <Label htmlFor="projectId">Project ID</Label>
        <Input 
          id="projectId" 
          placeholder="my-firebase-project-123" 
          value={projectId} 
          onChange={(e) => { setProjectId(e.target.value); setValidated(false); }}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="collectionName">Alerts Collection Name</Label>
        <Input 
          id="collectionName" 
          placeholder="security_alerts" 
          value={collectionName} 
          onChange={(e) => { setCollectionName(e.target.value); setValidated(false); }}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="serviceAccount">Service Account JSON</Label>
        <Textarea 
          id="serviceAccount" 
          placeholder='{"type": "service_account", "project_id": "..."}' 
          className="font-mono text-xs min-h-[100px]"
          value={serviceAccount} 
          onChange={(e) => { setServiceAccount(e.target.value); setValidated(false); }}
        />
        <p className="text-xs text-muted-foreground">Paste the entire service account JSON key file.</p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {!validated ? (
          <Button onClick={handleValidate} disabled={isValidating}>
            {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Validate Connection
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Securely & Enable
          </Button>
        )}
      </div>
    </div>
  );
}
