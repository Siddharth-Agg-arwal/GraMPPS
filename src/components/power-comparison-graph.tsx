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

export const description = ""

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "white",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// Custom Legend Content with white text
function CustomLegendContent(props: any) {
  return (
    <ChartLegendContent
      {...props}
      className="text-white dark:text-white"
    />
  );
}

export function PowerChart({ forecast }: { forecast: number[] }) {
  const [timeRange, setTimeRange] = React.useState("90d")
  type ChartDatum = { date: string; actual: number; forecast: number | null };
  const [chartData, setChartData] = React.useState<ChartDatum[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      // Fetch actuals
      const actualRes = await fetch("http://localhost:8000/api/actuals?limit=24");
      const actualData = await actualRes.json();
      const actualArray = Array.isArray(actualData) ? actualData : actualData.data || [];
      // Fetch forecast
      const forecastRes = await fetch("http://localhost:8000/run-forecast");
      const forecastData = await forecastRes.json(); // {forecast: [values], ...}

      // Merge by timestamp (assuming both are hourly and aligned)
      const merged = actualArray.map((row: { timestamp: any; value: any }, idx: string | number) => ({
        date: row.timestamp,
        actual: row.value,
        forecast: forecastData.forecast[idx] ?? null,
      }));

      setChartData(merged);
    }
    fetchData();
  }, []);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0 bg-[#2B2F47]">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-white">Area Chart - Interactive</CardTitle>
          <CardDescription className="text-neutral-200">
            Total Power Consumption
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
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
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
            <ChartLegend content={<CustomLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
