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
} from "@tabler/icons-react";
import StatValue from "./stat-values";
import { HeighestSeizures } from "./highest-seizures";
import { MostRecentSeizures } from "./most-recent-seizures";
import { PowerChart } from "./power-comparison-graph";

const res = await fetch("http://localhost:8000/stats/patients");
const data = await res.json();
console.log(data.total_patients);

export function BentoGridDemo() {
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
const items = [
{
    title: "Total Number of Patients",
    description: "Number of patients being monitored live now.",
    header: <StatValue value={data.total_patients} />,
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-200" />,
    className: "bg-[#393C67] border-none text-white",
},
{
    title: "At Risk Patients",
    description: "Patients who are experiencing seizures actively",
    header: <StatValue value={12} />,
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
    className: "bg-[#4409A1] border-none text-white",
},
{
    title: "Seizures Detected",
    description: "Number of seizures detected in the last 24 hours.",
    header: <StatValue value={134} />,
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    className: "bg-[#2B2F47] border-none text-white",
},
{
    title: "Average Seizure Frequency",
    description: "Daily frequency of seizures being detected.",
    header: <PowerChart />,
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    className: "bg-[#2B2F47] md:col-span-3 md:row-span-2 border-none text-white",
},
{
    title: "Flagged Patients",
    description: "Patients with highest seizure frequency.",
    header: <HeighestSeizures />,
    icon: <IconBoxAlignTopLeft className="h-4 w-4 text-neutral-500" />,
    className: "bg-[#4409A1] border-none text-white md:col-span-2",
},
{
    title: "Most Recent Seizure Patients",
    description: "Patients who had seizures most recently.",
    header: <MostRecentSeizures />,
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
    className: "bg-[#393C67] border-none text-white",
},
];

// Example fetch in Next.js/React

