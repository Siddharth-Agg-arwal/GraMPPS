"use client";

import React from "react";
import { IconLeaf, IconTrendingDown } from "@tabler/icons-react";

export default function CarbonFootprintReduction() {
const [carbonPercent, setCarbonPercent] = React.useState<number | null>(null);
const [reductionPercent, setReductionPercent] = React.useState<number | null>(null);

React.useEffect(() => {
    async function fetchData() {
    // Fetch from backend, adjust endpoint as needed
    const res = await fetch("http://localhost:8000/run-forecast");
    const data = await res.json();
    // Assume backend returns { carbon_percent: 72.3, carbon_reduction_percent: 18.5 }
    setCarbonPercent(data.carbon_percent ?? null);
    setReductionPercent(data.carbon_reduction_percent ?? null);
    }
    fetchData();
}, []);

return (
    <div className="flex flex-col items-center justify-center p-2">
    <div className="flex items-center gap-2 mb-2">
        <IconLeaf className="w-8 h-8 text-green-400" />
        <span className="text-3xl font-bold text-green-400">
        {typeof carbonPercent === "number" ? `${carbonPercent.toFixed(1)}%` : "--"}
        </span>
    </div>
    <div className="flex flex-col items-center">
        <span className="text-sm text-gray-300 mt-1">
        Carbon footprint reduced by
        </span>
        <div className="flex items-center gap-1 mt-1">
        <IconTrendingDown className="w-5 h-5 text-green-400" />
        <span className="text-lg font-semibold text-green-400">
            {typeof reductionPercent === "number" ? `${reductionPercent.toFixed(1)}%` : "--"}
        </span>
        </div>
    </div>
    </div>
);
}