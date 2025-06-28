"use client";

import React from "react";
import { IconLeaf, IconTrendingDown } from "@tabler/icons-react";

export default function CarbonFootprintReduction({ carbon }: { carbon: number }) {
const carbonPercent = carbon;
const reductionPercent = 18.5; // Assuming a static reduction percent for now

return (
    <div className="flex flex-col items-center justify-center p-2 h-full">
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