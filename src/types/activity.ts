import type { LogRow } from "@/types/log";
import type { FoodPreference } from "@/types/food";

export type LogActivityItem = {
  source: "log";
  id: string;
  timestamp: string;
  action_type: LogRow["action_type"];
  amount: number;
  unit: string;
  details: string | null;
};

export type SolidActivityItem = {
  source: "solid";
  id: string;
  timestamp: string;
  food_id: string;
  food_name: string;
  preference: FoodPreference;
  had_reaction: boolean;
  reaction_notes: string | null;
  comment: string | null;
};

export type ActivityItem = LogActivityItem | SolidActivityItem;

export function logToActivityItem(log: LogRow): LogActivityItem {
  return {
    source: "log",
    id: String(log.id),
    timestamp: log.timestamp,
    action_type: log.action_type,
    amount: Number(log.amount),
    unit: log.unit,
    details: log.details,
  };
}
