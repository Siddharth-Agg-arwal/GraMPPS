"use client";

import React, { JSX } from "react";
import { IconPigMoney, IconTrendingUp, IconCalendar, IconChartPie, IconTrendingDown } from "@tabler/icons-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";

const options = [
{ label: "Daily Savings", value: "daily" },
{ label: "Monthly Savings", value: "monthly" },
{ label: "Overall Savings", value: "overall" },
];

export default function CostSavings({
percent,
diff,
}: {
percent: number;
diff: number;
}) {
const [selected, setSelected] = React.useState(options[0].value);

const iconMap: Record<string, JSX.Element> = {
    daily: <IconCalendar className="w-8 h-8 text-blue-400" />,
    monthly: <IconChartPie className="w-8 h-8 text-purple-400" />,
    overall: <IconPigMoney className="w-8 h-8 text-green-400" />,
};

return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full h-full">
    <div className="absolute top-2 right-2 z-10">
        <Dropdown>
        <DropdownTrigger>
            <Button
            className="capitalize bg-white text-black border-none rounded-lg px-3 py-1 text-sm"
            variant="bordered"
            >
            {options.find(opt => opt.value === selected)?.label}
            </Button>
        </DropdownTrigger>
        <DropdownMenu
            disallowEmptySelection
            aria-label="Select savings period"
            closeOnSelect={true}
            selectedKeys={new Set([selected])}
            selectionMode="single"
            variant="flat"
            onSelectionChange={keys => setSelected(Array.from(keys)[0] as string)}
            className="bg-gradient-to-r from-[#2B2F47] to-[#393C67] text-white min-w-0 rounded-lg border-0.5 border-neutral-600"
        >
            {options.map(opt => (
            <DropdownItem
                key={opt.value}
                className="text-white data-[selected=true]:font-bold data-[hovered=true]:bg-[#393C67]"
            >
                {opt.label}
            </DropdownItem>
            ))}
        </DropdownMenu>
        </Dropdown>
    </div>
    <div className="flex flex-col items-center justify-center mt-6">
        <div className="flex items-center gap-2 mb-2">
        {iconMap[selected]}
        <span className="text-3xl font-bold text-green-400">
            {typeof percent === "number" && !isNaN(percent) ? `${percent.toFixed(1)}%` : "--"}
        </span>
        </div>
        <span className="text-sm text-gray-300 mt-1 flex">
        Cost reduced by ₹{diff.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        &nbsp;&nbsp;<IconTrendingDown className="w-5 h-5 text-green-400" />
        </span>
        {selected === "overall" && (
        <IconTrendingUp className="w-6 h-6 text-green-400 mt-2" />
        )}
    </div>
    </div>
);
}