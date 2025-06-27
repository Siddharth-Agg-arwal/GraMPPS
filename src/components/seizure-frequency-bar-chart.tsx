"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card"
import {
ChartConfig,
ChartContainer,
ChartTooltip,
ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart with a label"

const chartData = [
{ month: "January", desktop: 186 },
{ month: "February", desktop: 305 },
{ month: "March", desktop: 237 },
{ month: "April", desktop: 73 },
{ month: "May", desktop: 209 },
{ month: "June", desktop: 214 },
]

const chartConfig = {
desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
},
} satisfies ChartConfig

export function SeizureFrequencyBarChart() {
return (
    <div className="w-full h-full flex-1 min-h-0">
    <ChartContainer config={chartConfig} className="w-full h-full min-h-0">
        <BarChart
        width={undefined}
        height={undefined}
        data={chartData}
        margin={{
            top: 10,
        }}
        style={{ width: "100%", height: "100%" }}
        >
        <CartesianGrid vertical={false} />
        <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="desktop" fill="#D6D7F5" radius={8}>
            <LabelList
            position="top"
            offset={12}
            fontSize={12}
            />
        </Bar>
        </BarChart>
    </ChartContainer>
    </div>
)
}
