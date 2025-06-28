import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import {
IconArrowWaveRightUp,
IconBoxAlignRightFilled,
IconBoxAlignTopLeft,
IconClipboardCopy,
IconFileBroken,
IconSignature,
IconTableColumn,
IconPigMoney,
} from "@tabler/icons-react";
import StatValue from "./stat-values";
import { PowerChart } from "./power-comparison-graph";
import PowerStatus from "./power-status";
import CostSavings from "./cost-savings";
import CarbonFootprintReduction from "./carbon-footprint-reduction";


// const res = await fetch("http://localhost:8000/stats/patients");
// const data = await res.json();
// console.log(data.total_patients);

export function BentoGridDemo({ forecastData }: { forecastData: any }) {
    const [currentReading, setCurrentReading] = React.useState<number | null>(null);
    const [forecastedValue, setForecastedValue] = React.useState<number | null>(null);

    React.useEffect(() => {
        async function fetchCurrentReadingAndForecast() {
            const res = await fetch("http://localhost:8000/api/current-reading");
            const data = await res.json();
            // Trim value to 2 decimal places if it's a number
            const value = typeof data.value === "number" ? Number(data.value.toFixed(2)) : data.value;
            setCurrentReading(value);

            // Find the forecasted value closest to the current reading's timestamp
            if (forecastData && Array.isArray(forecastData.forecast) && forecastData.forecast.length > 0) {
                // If you have the index or timestamp mapping, use that.
                // For now, assume the first forecast value is the next value after the latest actual.
                setForecastedValue(Number(forecastData.forecast[0]?.toFixed(2)));
            }
        }
        fetchCurrentReadingAndForecast();
        const interval = setInterval(fetchCurrentReadingAndForecast, 5000); // poll every 5s for demo, or 5min for prod
        return () => clearInterval(interval);
    }, [forecastData]);

    const items = [
        {
            title: "Current Reading (kWh)",
            description: "Last reading taken from the power meter.",
            header: <StatValue value={currentReading ?? -1} />,
            icon: <IconClipboardCopy className="h-4 w-4 text-neutral-200" />,
            className: "bg-[#393C67] border-none text-white",
        },
        {
            title: "Forecasted Consumption (kWh)",
            description: "Predicted power consumption for current time.",
            header: <StatValue value={forecastedValue ?? -1} />,
            icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
            className: "bg-[#4409A1] border-none text-white",
        },
        {
            title: "Power Consumption Status",
            description: "Current power consumption is sub-optimal or not.",
            header: <PowerStatus status="Efficient" />,
            icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
            className: "bg-[#2B2F47] border-none text-white",
        },
        {
            title: "Live Actual and Forecasted Power Consumption",
            description: "Graphs comparing the forecasted expenditure and actual power being used.",
            header: <PowerChart forecast={forecastData.forecast} />,
            icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
            className: "bg-[#2B2F47] md:col-span-3 md:row-span-2 border-none text-white",
        },
        {
            title: "Cost Savings",
            description: "See your current cost savings compared to baseline.",
            header: <CostSavings cost={forecastData.cost} />,
            icon: <IconPigMoney className="h-4 w-4 text-green-400" />,
            className: "bg-[#4409A1] border-none text-white md:col-span-2",
        },
        {
            title: "Carbon Footprint Reduction",
            description: "Your current carbon footprint and reduction achieved.",
            header: <CarbonFootprintReduction carbon={forecastData.carbon} />,
            icon: <IconBoxAlignRightFilled className="h-4 w-4 text-green-400" />,
            className: "bg-[#393C67] border-none text-white",
        },
    ];
    return (
        <BentoGrid className="max-w-5xl mx-auto">
            {items.map((item, i) => (
                <BentoGridItem
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    icon={item.icon}
                    className={cn(item.className)}
                />
            ))}
        </BentoGrid>
    );
}
const Skeleton = () => (
<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);
