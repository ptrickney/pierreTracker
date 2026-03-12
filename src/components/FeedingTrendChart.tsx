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
  const [data, setData] = useState<{ day: string; volume: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Feeding Volume (7 Days)
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-center text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Feeding Volume (7 Days)
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-[300px] animate-pulse rounded bg-gray-100" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Feeding Volume (7 Days)
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="volume" fill="#4F86F7" name="Volume" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
