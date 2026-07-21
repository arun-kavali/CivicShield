import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useAttackTrends } from "@/hooks/useAnalytics";

const COLORS = ["hsl(0, 84%, 60%)", "hsl(24, 90%, 55%)", "hsl(45, 90%, 55%)", "hsl(200, 85%, 55%)", "hsl(160, 84%, 45%)"];

export function AttackTrendsChart() {
  const { data, isLoading } = useAttackTrends(30, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attack Trends (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="h-48 bg-muted animate-pulse rounded" />
        ) : data.series.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            No attack data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {data.series.map((s, i) => (
                <Bar key={s} dataKey={s} stackId="a" fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
