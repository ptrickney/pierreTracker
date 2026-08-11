import { getSupabase } from "./supabase";
import {
  deleteFoodExposure,
  fetchRecentFoodExposures,
} from "@/lib/foodQueries";
import { getTrendWindow, type TrendWindow } from "@/lib/trendWindow";
import {
  logToActivityItem,
  type ActivityItem,
  type SolidActivityItem,
} from "@/types/activity";
import type { LogRow } from "@/types/log";

/** Builds an ISO timestamp for a given date and "HH:MM" (24h) time in local timezone. */
export function buildTimestamp(date: Date, timeHHMM: string): string {
  const [hours, minutes] = timeHHMM.split(":").map(Number);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
  return d.toISOString();
}

export type InsertLogParams = {
  action_type: LogRow["action_type"];
  amount: number;
  unit: string;
  details?: string | null;
  timestamp: string;
};

export async function insertLog(params: InsertLogParams): Promise<LogRow> {
  const { data, error } = await getSupabase()
    .from("logs")
    .insert({
      action_type: params.action_type,
      amount: params.amount,
      unit: params.unit,
      details: params.details ?? null,
      timestamp: params.timestamp,
    })
    .select()
    .single();
  if (error) throw error;
  return data as LogRow;
}

export async function deleteLog(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("logs")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

function getTodayBoundsUTC(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function fetchTodayLogs(): Promise<LogRow[]> {
  const { start, end } = getTodayBoundsUTC();
  const { data, error } = await getSupabase()
    .from("logs")
    .select("*")
    .gte("timestamp", start)
    .lt("timestamp", end)
    .order("timestamp", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LogRow[];
}

export async function fetchLastFeed(): Promise<LogRow | null> {
  const { data, error } = await getSupabase()
    .from("logs")
    .select("*")
    .eq("action_type", "feed")
    .order("timestamp", { ascending: false })
    .limit(1);
  if (error) throw error;
  return (data?.[0] as LogRow) ?? null;
}

export const RECENT_LOGS_PAGE_SIZE = 20;

export async function fetchRecentLogs(
  limit: number = RECENT_LOGS_PAGE_SIZE,
  offset: number = 0
): Promise<LogRow[]> {
  const { data, error } = await getSupabase()
    .from("logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as LogRow[];
}

function exposureToActivityItem(
  exposure: Awaited<ReturnType<typeof fetchRecentFoodExposures>>[number]
): SolidActivityItem {
  return {
    source: "solid",
    id: exposure.id,
    timestamp: exposure.timestamp,
    food_id: exposure.food_id,
    food_name: exposure.food.name,
    preference: exposure.preference,
    had_reaction: exposure.had_reaction,
    reaction_notes: exposure.reaction_notes,
    comment: exposure.comment,
  };
}

/**
 * Merge recent logs + solid exposures, newest first.
 * Uses timestamp cursor for "load more" (not offset), since sources are separate tables.
 */
export async function fetchRecentActivity(
  limit: number = RECENT_LOGS_PAGE_SIZE,
  beforeTimestamp?: string
): Promise<ActivityItem[]> {
  let logsQuery = getSupabase()
    .from("logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (beforeTimestamp) {
    logsQuery = logsQuery.lt("timestamp", beforeTimestamp);
  }
  const [{ data: logsData, error: logsError }, exposures] = await Promise.all([
    logsQuery,
    fetchRecentFoodExposures(limit, beforeTimestamp),
  ]);
  if (logsError) throw logsError;

  const items: ActivityItem[] = [
    ...((logsData ?? []) as LogRow[]).map(logToActivityItem),
    ...exposures.map(exposureToActivityItem),
  ];

  return items
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
}

export async function deleteActivityItem(item: ActivityItem): Promise<void> {
  if (item.source === "solid") {
    await deleteFoodExposure(item.id);
    return;
  }
  await deleteLog(item.id);
}

type TrendQueryWindow = Pick<TrendWindow, "start" | "endExclusive">;

export async function fetchFeedTrendLogs(
  window: TrendQueryWindow = getTrendWindow()
): Promise<LogRow[]> {
  const { data, error } = await getSupabase()
    .from("logs")
    .select("*")
    .eq("action_type", "feed")
    .gte("timestamp", window.start.toISOString())
    .lt("timestamp", window.endExclusive.toISOString())
    .order("timestamp", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LogRow[];
}

export async function fetchDiaperTrendLogs(
  window: TrendQueryWindow = getTrendWindow()
): Promise<LogRow[]> {
  const { data, error } = await getSupabase()
    .from("logs")
    .select("*")
    .eq("action_type", "diaper")
    .gte("timestamp", window.start.toISOString())
    .lt("timestamp", window.endExclusive.toISOString())
    .order("timestamp", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LogRow[];
}
