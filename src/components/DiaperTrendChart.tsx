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
  const [data, setData] = useState<DayDiaperRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{TITLE}</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-center text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">{TITLE}</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-[300px] animate-pulse rounded bg-gray-100" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{TITLE}</h2>
      <p className="mb-3 text-sm text-gray-500">
        Stacked bars show wet and dirty changes per day (dirty on top).
      </p>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="wet"
              stackId="diapers"
              fill="#22c55e"
              name="Wet"
            />
            <Bar
              dataKey="dirty"
              stackId="diapers"
              fill="#d97706"
              name="Dirty"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
