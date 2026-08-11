"use client";

import type { ReactNode } from "react";
import { Clock, Baby, Moon, Droplets, Trash2, Loader2, UtensilsCrossed } from "lucide-react";
import { preferenceEmoji } from "@/lib/foodConstants";
import type { ActivityItem } from "@/types/activity";

const LOG_ICONS = {
  feed: Baby,
  sleep: Moon,
  diaper: Droplets,
} as const;

const LOG_COLORS = {
  feed: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 dark:ring-1 dark:ring-blue-800",
  sleep:
    "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300 dark:ring-1 dark:ring-purple-800",
  diaper:
    "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300 dark:ring-1 dark:ring-green-800",
} as const;

const SOLID_COLOR =
  "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300 dark:ring-1 dark:ring-orange-800";

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
  item,
  onDelete,
  deleting = false,
}: {
  item: ActivityItem;
  onDelete?: (item: ActivityItem) => Promise<void>;
  deleting?: boolean;
}) {
  const handleDelete = () => {
    if (onDelete && !deleting) onDelete(item);
  };

  let typeLabel: string;
  let detailLine: string;
  let iconNode: ReactNode;
  let color: string;

  if (item.source === "solid") {
    typeLabel = "Solid Food";
    const parts = [
      `${preferenceEmoji(item.preference)} ${item.food_name}`,
    ];
    if (item.had_reaction) parts.push("Reaction");
    if (item.comment) parts.push(item.comment);
    detailLine = parts.join(" · ");
    iconNode = <UtensilsCrossed className="h-4 w-4" />;
    color = SOLID_COLOR;
  } else {
    const Icon = LOG_ICONS[item.action_type];
    color = LOG_COLORS[item.action_type];
    typeLabel =
      item.action_type.charAt(0).toUpperCase() + item.action_type.slice(1);
    const amountUnit = `${item.amount} ${item.unit}`;
    detailLine = item.details
      ? `${amountUnit} | ${item.details}`
      : amountUnit;
    iconNode = <Icon className="h-4 w-4" />;
  }

  return (
    <div className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-b-0 dark:border-zinc-700">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}
      >
        {iconNode}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 dark:text-zinc-50">{typeLabel}</p>
        <p className="text-sm text-gray-600 dark:text-zinc-400">{detailLine}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-500">
        <Clock className="h-4 w-4" />
        {formatEventTime(item.timestamp)}
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-md text-gray-400 outline outline-1 outline-gray-300 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 dark:text-zinc-500 dark:outline-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
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
