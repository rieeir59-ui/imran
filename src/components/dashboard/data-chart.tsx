"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface DataChartProps {
  data: { name: string; value: number }[];
}

export default function DataChart({ data }: DataChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Value Overview</CardTitle>
        <CardDescription>Total asset value by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickFormatter={(value) => `$${Number(value) / 1000000}M`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(Number(value))}/>}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
