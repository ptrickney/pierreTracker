"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import EventRow from "./EventRow";
import { fetchRecentActivity, RECENT_LOGS_PAGE_SIZE } from "@/lib/queries";
import type { ActivityItem } from "@/types/activity";

function itemKey(item: ActivityItem): string {
  return `${item.source}:${item.id}`;
}

export default function RecentActivity({
  recentItems,
  onDelete,
}: {
  recentItems: ActivityItem[];
  onDelete?: (item: ActivityItem) => Promise<void>;
}) {
  const [allItems, setAllItems] = useState<ActivityItem[]>(recentItems);
  const [hasMore, setHasMore] = useState(
    recentItems.length >= RECENT_LOGS_PAGE_SIZE
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const sorted = [...allItems].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const seen = new Set<string>();
  const deduped = sorted.filter((item) => {
    const key = itemKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const handleLoadMore = async () => {
    if (deduped.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = deduped[deduped.length - 1].timestamp;
      const next = await fetchRecentActivity(RECENT_LOGS_PAGE_SIZE, oldest);
      setAllItems((prev) => [...prev, ...next]);
      if (next.length < RECENT_LOGS_PAGE_SIZE) {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (item: ActivityItem) => {
    if (!onDelete) return;
    const key = itemKey(item);
    setDeletingKey(key);
    try {
      await onDelete(item);
      setAllItems((prev) =>
        prev.filter((row) => itemKey(row) !== key)
      );
    } finally {
      setDeletingKey(null);
    }
  };

  const parentKey = recentItems.map(itemKey).join(",");
  const [prevParentKey, setPrevParentKey] = useState(parentKey);
  if (parentKey !== prevParentKey) {
    setPrevParentKey(parentKey);
    setAllItems(recentItems);
    setHasMore(recentItems.length >= RECENT_LOGS_PAGE_SIZE);
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
            {deduped.map((item) => (
              <EventRow
                key={itemKey(item)}
                item={item}
                onDelete={onDelete ? handleDelete : undefined}
                deleting={deletingKey === itemKey(item)}
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
