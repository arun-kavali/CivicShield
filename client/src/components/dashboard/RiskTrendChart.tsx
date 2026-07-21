import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useRiskTrend } from "@/hooks/useAnalytics";

export function RiskTrendChart() {
  const { data, isLoading } = useRiskTrend(14);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Risk Trend (14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="h-48 bg-muted animate-pulse rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="avgRisk" name="Avg Risk" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
