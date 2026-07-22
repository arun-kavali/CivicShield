import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export function ConnectorHealth() {
  const { data: connectors, isLoading } = useQuery({
    queryKey: ["data_connectors"],
    queryFn: async () => {
      try {
        const response = await api.get("/dashboard");
        return response?.data?.data?.connectorHealth ?? [];
      } catch (error) {
        console.error("Error fetching connectors:", error);
        return [];
      }
    },
  });

  const activeCount = connectors?.filter((c: any) => c.status === "active" && !c.error_message).length || 0;
  const errorCount = connectors?.filter((c: any) => c.status === "active" && c.error_message).length || 0;
  const inactiveCount = connectors?.filter((c: any) => c.status !== "active").length || 0;
  const totalCount = connectors?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Plug className="h-4 w-4 text-primary" />
          Connector Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center animate-pulse bg-muted/50 rounded-md" />
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
            <Plug className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No Connectors Configured</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Active & Healthy
              </div>
              <div className="font-semibold">{activeCount}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Degraded / Errors
              </div>
              <div className="font-semibold">{errorCount}</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4 text-destructive" />
                Inactive
              </div>
              <div className="font-semibold">{inactiveCount}</div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t mt-1">
              <div className="text-sm font-medium">Total Connectors</div>
              <div className="font-semibold">{totalCount}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
