"use client"

import React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  actual: { label: "Actual", color: "#BD3CD8" },
  forecast: { label: "Forecast", color: "#4409A1" },
  threshold: { label: "Threshold", color: "#F59E42" },
} satisfies ChartConfig

function CustomLegendContent(props: any) {
  return (
    <ChartLegendContent
      {...props}
      className="text-white dark:text-white"
    />
  );
}

export function PowerChart() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      const res = await fetch("http://localhost:8000/api/power-comparison");
      const data = await res.json();
      setChartData(data);
    }
    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Optionally filter by timeRange here

  return (
    <Card className="pt-0 bg-[#2B2F47]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-white">Power Comparison</CardTitle>
          <CardDescription className="text-neutral-200">
            Actual, Forecasted, and Threshold Power Consumption
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex text-white border-[#393C67]"
            aria-label="Select a value"
          >
            <SelectValue
              className="text-white dark:text-white placeholder:text-white placeholder:dark:text-white"
              placeholder="Last 3 months"
            />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#BD3CD8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#BD3CD8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4409A1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4409A1" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillThreshold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E42" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E42" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleString("en-GB", {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "UTC"
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleString("en-GB", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC"
                    });
                  }}
                  indicator="dot"
                  className="text-white dark:text-white"
                />
              }
            />
            <Area
              dataKey="actual"
              type="natural"
              fill="url(#fillActual)"
              stroke="#BD3CD8"
              stackId="a"
              name="Actual"
            />
            <Area
              dataKey="forecast"
              type="natural"
              fill="url(#fillForecast)"
              stroke="#4409A1"
              stackId="a"
              name="Forecast"
            />
            <Area
              dataKey="threshold"
              type="natural"
              fill="url(#fillThreshold)"
              stroke="#F59E42"
              stackId="a"
              name="Threshold"
            />
            <ChartLegend content={<CustomLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
