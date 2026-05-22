"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchDiaperTrendLogs } from "@/lib/queries";
import {
  addLocalDays,
  calculateSevenDayAverage,
  canGoNextTrendWindow,
  formatDayLabel,
  getNextTrendWindowEnd,
  getPreviousTrendWindowEnd,
  getTrendLookbackStart,
  getTrendWindow,
  TREND_WINDOW_DAYS,
  type TrendWindow,
} from "@/lib/trendWindow";
import { useEffectiveDark } from "@/components/ThemeProvider";
import type { LogRow } from "@/types/log";

type DayDiaperRow = { day: string; wet: number; dirty: number; average: number };
type DiaperCounts = { wet: number; dirty: number };

const TITLE = "Diaper Changes (7 Days)";
const navButtonClassName =
  "min-h-[36px] rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

function formatAverage(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function aggregateDiapersByDay(logs: LogRow[], window: TrendWindow): DayDiaperRow[] {
  const byDate = new Map<string, DiaperCounts>();
  const lookbackStart = getTrendLookbackStart(window.start);
  const daysToCover = TREND_WINDOW_DAYS * 2 - 1;

  for (let i = 0; i < daysToCover; i++) {
    byDate.set(formatDayLabel(addLocalDays(lookbackStart, i)), { wet: 0, dirty: 0 });
  }

  for (const log of logs) {
    if (log.action_type !== "diaper") continue;
    const key = formatDayLabel(new Date(log.timestamp));
    const bucket = byDate.get(key);
    if (!bucket) continue;
    if (log.unit === "dirty") bucket.dirty += 1;
    else if (log.unit === "wet") bucket.wet += 1;
  }

  return Array.from({ length: TREND_WINDOW_DAYS }, (_, index) => {
    const date = addLocalDays(window.start, index);
    const day = formatDayLabel(date);
    const counts = byDate.get(day) ?? { wet: 0, dirty: 0 };
    const rollingValues = Array.from({ length: TREND_WINDOW_DAYS }, (_, rollingIndex) => {
      const rollingDate = addLocalDays(date, rollingIndex - (TREND_WINDOW_DAYS - 1));
      const rollingCounts = byDate.get(formatDayLabel(rollingDate));
      return (rollingCounts?.wet ?? 0) + (rollingCounts?.dirty ?? 0);
    });

    return {
      day,
      wet: counts.wet,
      dirty: counts.dirty,
      average: Number(calculateSevenDayAverage(rollingValues).toFixed(1)),
    };
  });
}

export default function DiaperTrendChart() {
  const isDark = useEffectiveDark();
  const [windowEndDate, setWindowEndDate] = useState(() => getTrendWindow().endDate);
  const [data, setData] = useState<DayDiaperRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trendWindow = getTrendWindow(windowEndDate);
  const canGoNext = canGoNextTrendWindow(windowEndDate);
  const currentAverage = data.at(-1)?.average ?? 0;
  const wetAverage = calculateSevenDayAverage(data.map((row) => row.wet));
  const dirtyAverage = calculateSevenDayAverage(data.map((row) => row.dirty));

  const gridStroke = isDark ? "#3f3f46" : "#f0f0f0";
  const tickColor = isDark ? "#a1a1aa" : "#525252";
  const wetFill = isDark ? "#4ade80" : "#22c55e";
  const dirtyFill = isDark ? "#fbbf24" : "#d97706";
  const averageStroke = isDark ? "#60a5fa" : "#2563eb";
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
    const window = getTrendWindow(windowEndDate);
    const queryWindow = {
      start: getTrendLookbackStart(window.start),
      endExclusive: window.endExclusive,
    };

    setLoading(true);
    setError(null);
    fetchDiaperTrendLogs(queryWindow)
      .then((logs) => {
        if (!cancelled) setData(aggregateDiapersByDay(logs, window));
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
  }, [windowEndDate]);

  return (
    <section>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
            {TITLE}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            {trendWindow.label}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={navButtonClassName}
            onClick={() => setWindowEndDate(getPreviousTrendWindowEnd(windowEndDate))}
          >
            Previous day
          </button>
          <button
            type="button"
            className={navButtonClassName}
            onClick={() => setWindowEndDate(getNextTrendWindowEnd(windowEndDate))}
            disabled={!canGoNext}
          >
            Next day
          </button>
          <button
            type="button"
            className={navButtonClassName}
            onClick={() => setWindowEndDate(getTrendWindow().endDate)}
            disabled={!canGoNext}
          >
            Today
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
          <p className="text-center text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
          <div className="h-[300px] animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-gray-500 dark:text-zinc-400">
            Stacked bars show wet and dirty changes. Running 7-day average: {formatAverage(currentAverage)} changes/day ({formatAverage(wetAverage)} wet, {formatAverage(dirtyAverage)} dirty).
          </p>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke={averageStroke}
                  strokeWidth={2}
                  dot={false}
                  name="7-day avg"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}
