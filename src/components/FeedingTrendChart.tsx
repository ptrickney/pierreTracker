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
} from "recharts";
import { fetchLast7DaysFeedLogs } from "@/lib/queries";
import { useEffectiveDark } from "@/components/ThemeProvider";
import type { LogRow } from "@/types/log";

function formatDayLabel(date: Date): string {
  const mon = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${mon} ${day.toString().padStart(2, "0")}`;
}

function aggregateByDay(logs: LogRow[]): { day: string; volume: number }[] {
  const byDate = new Map<string, number>();
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDayLabel(d);
    byDate.set(key, 0);
  }
  for (const log of logs) {
    const d = new Date(log.timestamp);
    const key = formatDayLabel(d);
    const prev = byDate.get(key) ?? 0;
    byDate.set(key, prev + Number(log.amount));
  }
  return Array.from(byDate.entries()).map(([day, volume]) => ({ day, volume }));
}

export default function FeedingTrendChart() {
  const isDark = useEffectiveDark();
  const [data, setData] = useState<{ day: string; volume: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gridStroke = isDark ? "#3f3f46" : "#f0f0f0";
  const tickColor = isDark ? "#a1a1aa" : "#525252";
  const barFill = isDark ? "#60a5fa" : "#4F86F7";
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
    fetchLast7DaysFeedLogs()
      .then((logs) => {
        if (!cancelled) setData(aggregateByDay(logs));
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
          Feeding Volume (7 Days)
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
          Feeding Volume (7 Days)
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
        Feeding Volume (7 Days)
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="volume" fill={barFill} name="Volume" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
