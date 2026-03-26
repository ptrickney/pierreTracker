"use client";

import { Clock, Baby, Moon, Droplets } from "lucide-react";
import type { LogRow } from "@/types/log";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatFeedTime(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday(iso)) return time;
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${date}, ${time}`;
}

function LastFeedCard({ lastFeed }: { lastFeed: LogRow | null }) {
  return (
    <div className="rounded-xl bg-blue-500 p-4 text-white shadow-sm dark:bg-blue-600 md:col-span-1">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 dark:bg-blue-500/80">
          <Clock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide opacity-90">
            Last Feed
          </p>
          {lastFeed ? (
            <>
              <p className="text-xl font-bold">{formatFeedTime(lastFeed.timestamp)}</p>
              <p className="text-sm opacity-90">
                {lastFeed.amount} {lastFeed.unit}
              </p>
            </>
          ) : (
            <p className="text-xl font-bold">—</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg} dark:bg-zinc-800 dark:ring-1 dark:ring-zinc-600`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-zinc-50">
            {value}
            <span className="ml-1 text-sm font-normal text-gray-500 dark:text-zinc-400">
              {unit}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TodaySummary({
  logs,
  lastFeed,
}: {
  logs: LogRow[];
  lastFeed: LogRow | null;
}) {
  const feeds = logs.filter((l) => l.action_type === "feed");
  const sleep = logs.filter((l) => l.action_type === "sleep");
  const diapers = logs.filter((l) => l.action_type === "diaper");
  const fedTotal = feeds.reduce((s, l) => s + Number(l.amount), 0);
  const sleptTotal = sleep.reduce((s, l) => s + Number(l.amount), 0);
  const unitFeed = feeds[0]?.unit ?? "oz";
  const unitSleep = sleep[0]?.unit ?? "hrs";

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-zinc-50">
        Today&apos;s Summary
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LastFeedCard lastFeed={lastFeed} />
        <StatCard
          label="Fed Today"
          value={fedTotal || "0"}
          unit={unitFeed}
          icon={Baby}
          iconBg="bg-blue-100"
          iconColor="text-blue-600 dark:text-blue-300"
        />
        <StatCard
          label="Slept Today"
          value={sleptTotal || "0"}
          unit={unitSleep}
          icon={Moon}
          iconBg="bg-purple-100"
          iconColor="text-purple-600 dark:text-purple-300"
        />
        <StatCard
          label="Diapers Today"
          value={diapers.length || "0"}
          unit="chgs"
          icon={Droplets}
          iconBg="bg-green-100"
          iconColor="text-green-600 dark:text-green-300"
        />
      </div>
    </section>
  );
}
