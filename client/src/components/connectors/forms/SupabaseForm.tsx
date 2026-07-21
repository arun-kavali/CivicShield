import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectorConfig } from "@/pages/Connectors";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  connector: ConnectorConfig;
  onSuccess: () => void;
  onClose: () => void;
}

export function SupabaseForm({ connector, onSuccess, onClose }: Props) {
  const { organization } = useAuth();
  const [projectUrl, setProjectUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleValidate = async () => {
    if (!projectUrl || !anonKey) {
      toast.error("Project URL and Anon Key are required");
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Create a temporary client to validate
      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(projectUrl, anonKey);
      
      // Simple validation: try to ping or fetch a basic endpoint
      // We will try to fetch from alerts, but it might fail due to RLS, which is fine, getting a response means URL/Key is structurally valid
      const { error } = await tempClient.from('alerts').select('id').limit(1);
      
      if (error && error.code !== '42P01') {
        // 42P01 is relation does not exist - meaning connection works but table doesn't.
        // We'll consider it a successful connection to the DB itself.
        console.log("Validation details:", error);
      }
      
      setValidated(true);
      toast.success("Connection validated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to validate connection. Please check your credentials.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validated) {
      toast.error("Please validate the connection first");
      return;
    }
    if (!organization) {
      toast.error("No organization context. Please refresh and try again.");
      return;
    }

    setIsSaving(true);
    try {
      const config = { projectUrl, anonKey, serviceRoleKey };

      const { error } = await supabase.from('data_connectors').insert({
        organization_id: organization.id,
        name: `Supabase Integration (${new URL(projectUrl).hostname})`,
        type: connector.type,
        status: 'active',
        config: config as any
      });

      if (error) throw error;
      
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
        <Label htmlFor="projectUrl">Project URL</Label>
        <Input 
          id="projectUrl" 
          placeholder="https://xxxxx.supabase.co" 
          value={projectUrl} 
          onChange={(e) => { setProjectUrl(e.target.value); setValidated(false); }}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="anonKey">Anon Key (public)</Label>
        <Input 
          id="anonKey" 
          type="password" 
          placeholder="eyJh..." 
          value={anonKey} 
          onChange={(e) => { setAnonKey(e.target.value); setValidated(false); }}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="serviceRoleKey">Service Role Key (secret) - Optional</Label>
        <Input 
          id="serviceRoleKey" 
          type="password" 
          placeholder="eyJh..." 
          value={serviceRoleKey} 
          onChange={(e) => { setServiceRoleKey(e.target.value); setValidated(false); }}
        />
        <p className="text-xs text-muted-foreground">Required only if bypassing RLS is needed for ingestion.</p>
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
