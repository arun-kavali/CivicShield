import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConnectorConfig } from "@/pages/Connectors";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Loader2, UploadCloud, File, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  connector: ConnectorConfig;
  onSuccess: () => void;
  onClose: () => void;
}

export function CSVUploadForm({ connector, onSuccess, onClose }: Props) {
  const { organization } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validated, setValidated] = useState(false);
  const [csvContent, setCsvContent] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "text/csv" && !selected.name.endsWith(".csv")) {
        toast.error("Please upload a valid CSV file");
        return;
      }
      setFile(selected);
      setValidated(false);
    }
  };

  const handleValidate = () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsValidating(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setCsvContent(text);
        const firstLine = text.split('\n')[0];
        const parsedHeaders = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        if (parsedHeaders.length < 2) {
          throw new Error("Invalid CSV format or insufficient columns");
        }

        setHeaders(parsedHeaders);
        setValidated(true);
        toast.success("CSV validated successfully. Found " + parsedHeaders.length + " columns.");
      } catch (err: unknown) {
        toast.error((err as Error).message || "Failed to parse CSV");
      } finally {
        setIsValidating(false);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
      setIsValidating(false);
    };

    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!validated || !file || !organization) return;

    setIsSaving(true);
    try {
      // 1. Parse rows and upload alerts
      const rows = csvContent.split('\n').filter(r => r.trim());
      const headerRow = headers.map(h => h.toLowerCase());

      const alertsToInsert = [];
      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        // Basic naive CSV split (doesn't handle commas in quotes)
        const cols = rows[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));

        const alert_type = cols[headerRow.indexOf('alert_type')] || cols[headerRow.indexOf('type')] || 'CSV Import Alert';
        const severity = cols[headerRow.indexOf('severity')] || 'Medium';
        const source = cols[headerRow.indexOf('source_system')] || cols[headerRow.indexOf('source')] || 'CSV Upload';

        alertsToInsert.push({
          organization_id: organization.id,
          alert_type,
          severity,
          source_system: source,
          raw_log: { original_row: rows[i], imported_from: file.name }
        });
      }

      if (alertsToInsert.length > 0) {
        await Promise.all(alertsToInsert.map((alert) => api.post('/api/alerts/ingest', alert)));
      }

      // 2. Save Connector Config
      const config = { fileName: file.name, headers, rowsImported: alertsToInsert.length };
      await api.post('/api/integrations', {
        organization_id: organization.id,
        integrationName: `CSV Upload (${file.name})`,
        integrationType: 'rest',
        connectionMode: 'pull',
        connectionStatus: 'connected',
        syncEnabled: true,
        metadata: config,
      });

      toast.success(`Successfully imported ${alertsToInsert.length} alerts!`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to import CSV data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">

      {!file ? (
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
          <h4 className="text-sm font-medium mb-1">Drag and drop CSV or click to browse</h4>
          <p className="text-xs text-muted-foreground">Support for .csv files up to 50MB</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { setFile(null); setValidated(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {validated && headers.length > 0 && (
        <div className="space-y-3 pt-2">
          <Label>Detected Columns</Label>
          <div className="flex flex-wrap gap-2">
            {headers.slice(0, 8).map((header, i) => (
              <span key={i} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                {header}
              </span>
            ))}
            {headers.length > 8 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                +{headers.length - 8} more
              </span>
            )}
          </div>

          <div className="bg-warning/10 text-warning text-xs p-3 rounded-md flex gap-2 items-start mt-4">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Duplicate Detection is enabled. Rows with matching hashes will be skipped during ingestion.</span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {!validated ? (
          <Button onClick={handleValidate} disabled={isValidating || !file}>
            {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Preview & Validate
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  );
}
