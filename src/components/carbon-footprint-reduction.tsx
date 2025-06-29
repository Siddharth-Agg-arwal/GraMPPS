"use client";

import React from "react";
import { IconLeaf, IconTrendingDown } from "@tabler/icons-react";

export default function CarbonFootprintReduction({
percent,
diff,
}: {
percent: number;
diff: number;
}) {
return (
    <div className="flex flex-col items-center justify-center p-2 h-full">
    <div className="flex items-center gap-2 mb-2">
        <IconLeaf className="w-8 h-8 text-green-400" />
        <span className="text-3xl font-bold text-green-400">
        {typeof percent === "number" ? `${percent.toFixed(1)}%` : "--"}
        </span>
    </div>
    <div className="flex flex-row items-center">
        <span className="text-sm text-gray-300 mt-1">
        Reduced by{" "}
        {diff.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO₂
        </span>
        <div className="flex items-center gap-1 mt-1">
        &nbsp;<IconTrendingDown className="w-5 h-5 text-green-400" />
        </div>
    </div>
    </div>
);
}