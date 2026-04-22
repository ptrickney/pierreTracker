"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import EventRow from "./EventRow";
import { fetchRecentLogs, RECENT_LOGS_PAGE_SIZE } from "@/lib/queries";
import type { LogRow } from "@/types/log";

export default function RecentActivity({
  recentLogs,
  onDelete,
}: {
  recentLogs: LogRow[];
  onDelete?: (id: string) => Promise<void>;
}) {
  const [allLogs, setAllLogs] = useState<LogRow[]>(recentLogs);
  const [hasMore, setHasMore] = useState(
    recentLogs.length >= RECENT_LOGS_PAGE_SIZE
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...allLogs].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const seenIds = new Set<string>();
  const deduped = sorted.filter((log) => {
    if (seenIds.has(log.id)) return false;
    seenIds.add(log.id);
    return true;
  });

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await fetchRecentLogs(
        RECENT_LOGS_PAGE_SIZE,
        allLogs.length
      );
      setAllLogs((prev) => [...prev, ...next]);
      if (next.length < RECENT_LOGS_PAGE_SIZE) {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
      setAllLogs((prev) => prev.filter((log) => log.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  // Sync when parent refetches (e.g. after logging a new activity)
  const parentKey = recentLogs.map((l) => l.id).join(",");
  const [prevParentKey, setPrevParentKey] = useState(parentKey);
  if (parentKey !== prevParentKey) {
    setPrevParentKey(parentKey);
    setAllLogs(recentLogs);
    setHasMore(recentLogs.length >= RECENT_LOGS_PAGE_SIZE);
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-zinc-50">
        Recent Activity
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
        {deduped.length === 0 ? (
          <p className="py-8 text-center text-gray-500 dark:text-zinc-400">
            No recent events
          </p>
        ) : (
          <div className="divide-y divide-gray-100 px-4 dark:divide-zinc-700">
            {deduped.map((log) => (
              <EventRow
                key={log.id}
                log={log}
                onDelete={onDelete ? handleDelete : undefined}
                deleting={deletingId === log.id}
              />
            ))}
          </div>
        )}
        {hasMore && deduped.length > 0 && (
          <div className="border-t border-gray-100 py-3 text-center dark:border-zinc-700">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline disabled:opacity-60 dark:text-blue-400"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  View More
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
