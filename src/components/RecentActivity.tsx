"use client";

import EventRow from "./EventRow";
import type { LogRow } from "@/types/log";

export default function RecentActivity({ logs }: { logs: LogRow[] }) {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Recent Activity
      </h2>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No events recorded today
          </p>
        ) : (
          <div className="divide-y divide-gray-100 px-4">
            {sorted.map((log) => (
              <EventRow key={log.id} log={log} />
            ))}
          </div>
        )}
        {sorted.length > 0 && (
          <div className="border-t border-gray-100 py-3 text-center">
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View All History
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
