import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConnectorConfig } from "@/pages/Connectors";
import { FirebaseForm } from "./forms/FirebaseForm";
import { RestApiForm } from "./forms/RestApiForm";
import { CSVUploadForm } from "./forms/CSVUploadForm";

interface ConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  connector: ConnectorConfig;
  onSuccess: () => void;
}

export function ConnectorModal({ isOpen, onClose, connector, onSuccess }: ConnectorModalProps) {
  
  const renderForm = () => {
    switch (connector.type) {
      case "firebase":
        return <FirebaseForm connector={connector} onSuccess={onSuccess} onClose={onClose} />;
      case "rest":
        return <RestApiForm connector={connector} onSuccess={onSuccess} onClose={onClose} />;
      case "csv":
        return <CSVUploadForm connector={connector} onSuccess={onSuccess} onClose={onClose} />;
      default:
        return <div className="p-4 text-center text-muted-foreground">Form not implemented for this connector type.</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-md border border-border">
              {connector.icon}
            </div>
            <div>
              <DialogTitle>Configure {connector.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Enter your connection details to integrate with {connector.name}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {renderForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
