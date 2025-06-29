"use client"

import React from "react";
import { BentoGridDemo } from "@/components/bento-grid";

export default function Dashboard() {
    const [forecastTable, setForecastTable] = React.useState<any[]>([]);

    React.useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://localhost:8000/api/forecast-table");
                const forecastTableData = await res.json();
                setForecastTable(forecastTableData);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            }
        }
        fetchData();
    }, []);

    if (forecastTable.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-fit bg-[#242424] border-none">
            <main
                className="pt-8 pr-24 pb-8"
                style={{ width: "calc(100vw - 17rem)" }}
            >
                <BentoGridDemo
                    forecastTable={forecastTable}
                />
            </main>
        </div>
    );
}