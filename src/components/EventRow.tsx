"use client";

import { Clock, Baby, Moon, Droplets, Trash2, Loader2 } from "lucide-react";
import type { LogRow } from "@/types/log";

const ICONS = {
  feed: Baby,
  sleep: Moon,
  diaper: Droplets,
} as const;

const COLORS = {
  feed: "bg-blue-100 text-blue-600",
  sleep: "bg-purple-100 text-purple-600",
  diaper: "bg-green-100 text-green-600",
} as const;

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatEventTime(iso: string): string {
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

export default function EventRow({
  log,
  onDelete,
  deleting = false,
}: {
  log: LogRow;
  onDelete?: (id: string) => Promise<void>;
  deleting?: boolean;
}) {
  const Icon = ICONS[log.action_type];
  const color = COLORS[log.action_type];
  const typeLabel =
    log.action_type.charAt(0).toUpperCase() + log.action_type.slice(1);
  const amountUnit = `${log.amount} ${log.unit}`;
  const detailLine = log.details
    ? `${amountUnit} | ${log.details}`
    : amountUnit;

  const handleDelete = () => {
    if (onDelete && !deleting) onDelete(log.id);
  };

  return (
    <div className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-b-0">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{typeLabel}</p>
        <p className="text-sm text-gray-600">{detailLine}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        {formatEventTime(log.timestamp)}
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-md text-gray-400 outline outline-1 outline-gray-300 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50"
          aria-label="Delete activity"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
