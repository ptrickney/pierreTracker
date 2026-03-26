"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchLast7DaysDiaperLogs } from "@/lib/queries";
import { useEffectiveDark } from "@/components/ThemeProvider";
import type { LogRow } from "@/types/log";

function formatDayLabel(date: Date): string {
  const mon = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${mon} ${day.toString().padStart(2, "0")}`;
}

type DayDiaperRow = { day: string; wet: number; dirty: number };

function aggregateDiapersByDay(logs: LogRow[]): DayDiaperRow[] {
  const byDate = new Map<string, { wet: number; dirty: number }>();
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDayLabel(d);
    byDate.set(key, { wet: 0, dirty: 0 });
  }
  for (const log of logs) {
    if (log.action_type !== "diaper") continue;
    const d = new Date(log.timestamp);
    const key = formatDayLabel(d);
    const bucket = byDate.get(key);
    if (!bucket) continue;
    if (log.unit === "dirty") bucket.dirty += 1;
    else if (log.unit === "wet") bucket.wet += 1;
  }
  return Array.from(byDate.entries()).map(([day, counts]) => ({
    day,
    ...counts,
  }));
}

const TITLE = "Diaper Changes (7 Days)";

export default function DiaperTrendChart() {
  const isDark = useEffectiveDark();
  const [data, setData] = useState<DayDiaperRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gridStroke = isDark ? "#3f3f46" : "#f0f0f0";
  const tickColor = isDark ? "#a1a1aa" : "#525252";
  const wetFill = isDark ? "#4ade80" : "#22c55e";
  const dirtyFill = isDark ? "#fbbf24" : "#d97706";
  const tooltipStyle = isDark
    ? {
        backgroundColor: "#18181b",
        border: "1px solid #3f3f46",
        borderRadius: "0.5rem",
        color: "#fafafa",
      }
    : {
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
      };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchLast7DaysDiaperLogs()
      .then((logs) => {
        if (!cancelled) setData(aggregateDiapersByDay(logs));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-zinc-50">
          {TITLE}
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
          <p className="text-center text-red-600 dark:text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-zinc-50">
          {TITLE}
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
          <div className="h-[300px] animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-zinc-50">
        {TITLE}
      </h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-zinc-400">
        Stacked bars show wet and dirty changes per day (dirty on top).
      </p>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: tickColor }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: tickColor }} />
            <Bar
              dataKey="wet"
              stackId="diapers"
              fill={wetFill}
              name="Wet"
            />
            <Bar
              dataKey="dirty"
              stackId="diapers"
              fill={dirtyFill}
              name="Dirty"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
