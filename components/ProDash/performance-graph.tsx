"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const generateDummyData = () => {
  const data = [];
  const startDate = new Date("2024-01-01");
  let value = 10000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Add some random variation but keep it subtle
    value = value * (1 + (Math.random() * 0.02 - 0.01));

    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value)
    });
  }

  return data;
};

const data = generateDummyData();

export default function PerformanceGraph() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Portfolio Value",
              color: "hsl(var(--primary))"
            }
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string | number) => {
                  const date = new Date(value);
                  if (isNaN(date.getTime())) throw new Error("Invalid Date");
                  return `${date.getDate()}`; // why was Jan here
                }}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12 }}
                tickMargin={8}
                domain={["dataMin - 1000", "dataMax + 1000"]}
              />
              <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--color-value)", strokeWidth: 1, strokeDasharray: "4 4" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
