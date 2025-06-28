"use client";

import React, { JSX } from "react";
import { IconPigMoney, IconTrendingUp, IconCalendar, IconChartPie } from "@tabler/icons-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";

const options = [
{ label: "Weekly Savings", value: "weekly" },
{ label: "Monthly Savings", value: "monthly" },
{ label: "Overall Savings", value: "overall" },
];

export default function CostSavings() {
const [selected, setSelected] = React.useState(options[0].value);
const [savings, setSavings] = React.useState<number | null>(null);

React.useEffect(() => {
    async function fetchSavings() {
    const res = await fetch(`http://localhost:8000/run-forecast?savings_type=${selected}`);
    const data = await res.json();
    setSavings(typeof data.savings_percent === "number" ? data.savings_percent : null);
    }
    fetchSavings();
}, [selected]);

const iconMap: Record<string, JSX.Element> = {
    weekly: <IconCalendar className="w-8 h-8 text-blue-400" />,
    monthly: <IconChartPie className="w-8 h-8 text-purple-400" />,
    overall: <IconPigMoney className="w-8 h-8 text-green-400" />,
};

return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full">
    {/* Dropdown aligned to top right */}
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
    {/* Centered value and icon */}
    <div className="flex flex-col items-center justify-center mt-6">
        <div className="flex items-center gap-2 mb-2">
        {iconMap[selected]}
        <span className="text-3xl font-bold text-green-400">
            {typeof savings === "number" && !isNaN(savings) ? `${savings.toFixed(1)}%` : "--"}
        </span>
        </div>
        <span className="text-sm text-gray-300 mt-1">Cost Savings</span>
        {selected === "overall" && (
        <IconTrendingUp className="w-6 h-6 text-green-400 mt-2" />
        )}
    </div>
    </div>
);
}