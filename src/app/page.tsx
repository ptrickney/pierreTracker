"use client";

import { useEffect, useState } from "react";
import { Baby } from "lucide-react";
import ActivityLogger from "@/components/ActivityLogger";
import TodaySummary from "@/components/TodaySummary";
import RecentActivity from "@/components/RecentActivity";
import FeedingTrendChart from "@/components/FeedingTrendChart";
import DiaperTrendChart from "@/components/DiaperTrendChart";
import ThemeToggle from "@/components/ThemeToggle";
import { fetchTodayLogs, fetchLastFeed, fetchRecentLogs, deleteLog } from "@/lib/queries";
import type { LogRow } from "@/types/log";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
      <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-zinc-700" />
    </div>
  );
}

export default function Home() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [lastFeed, setLastFeed] = useState<LogRow | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    Promise.all([fetchTodayLogs(), fetchLastFeed(), fetchRecentLogs()])
      .then(([todayData, lastFeedData, recentData]) => {
        setLogs(todayData);
        setLastFeed(lastFeedData);
        setRecentLogs(recentData);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load data");
      });
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteLog(id);
      setError(null);
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete activity");
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchTodayLogs(), fetchLastFeed(), fetchRecentLogs()])
      .then(([todayData, lastFeedData, recentData]) => {
        if (!cancelled) {
          setLogs(todayData);
          setLastFeed(lastFeedData);
          setRecentLogs(recentData);
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
              Pierre Tracker
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              {formatDate(new Date())}
            </p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <ThemeToggle />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 dark:ring-1 dark:ring-blue-800">
              <Baby className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        ) : (
          <div className="space-y-8">
            <ActivityLogger onLogSaved={refetch} />
            <TodaySummary logs={logs ?? []} lastFeed={lastFeed} />
            <FeedingTrendChart />
            <DiaperTrendChart />
            <RecentActivity recentLogs={recentLogs ?? []} onDelete={handleDeleteActivity} />
          </div>
        )}
      </div>
    </main>
  );
}
