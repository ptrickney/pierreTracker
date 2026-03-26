"use client";

import { useState } from "react";
import EventRow from "./EventRow";
import type { LogRow } from "@/types/log";

export default function RecentActivity({
  recentLogs,
  onDelete,
}: {
  recentLogs: LogRow[];
  onDelete?: (id: string) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sorted = [...recentLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-zinc-50">
        Recent Activity
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-gray-500 dark:text-zinc-400">
            No recent events
          </p>
        ) : (
          <div className="divide-y divide-gray-100 px-4 dark:divide-zinc-700">
            {sorted.map((log) => (
              <EventRow
                key={log.id}
                log={log}
                onDelete={onDelete ? handleDelete : undefined}
                deleting={deletingId === log.id}
              />
            ))}
          </div>
        )}
        {sorted.length > 0 && (
          <div className="border-t border-gray-100 py-3 text-center dark:border-zinc-700">
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              View All History
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
