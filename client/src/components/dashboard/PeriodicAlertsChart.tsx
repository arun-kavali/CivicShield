import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useAlertsByPeriod } from "@/hooks/useAnalytics";

export function PeriodicAlertsChart() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const buckets = period === "day" ? 14 : period === "week" ? 12 : 12;
  const { data, isLoading } = useAlertsByPeriod(period, buckets);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Alerts by Period</CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="h-48 bg-muted animate-pulse rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="total" name="All Alerts" fill="hsl(200, 85%, 55%)" />
              <Bar dataKey="critical" name="Critical" fill="hsl(0, 84%, 60%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
