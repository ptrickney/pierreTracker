import { getSupabase } from "./supabase";
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

function getSevenDaysAgoUTC(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - 6);
  return start.toISOString();
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

export async function fetchRecentLogs(
  limit: number = 20
): Promise<LogRow[]> {
  const { data, error } = await getSupabase()
    .from("logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as LogRow[];
}

export async function fetchLast7DaysFeedLogs(): Promise<LogRow[]> {
  const start = getSevenDaysAgoUTC();
  const { data, error } = await getSupabase()
    .from("logs")
    .select("*")
    .eq("action_type", "feed")
    .gte("timestamp", start)
    .order("timestamp", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LogRow[];
}

export async function fetchLast7DaysDiaperLogs(): Promise<LogRow[]> {
  const start = getSevenDaysAgoUTC();
  const { data, error } = await getSupabase()
    .from("logs")
    .select("*")
    .eq("action_type", "diaper")
    .gte("timestamp", start)
    .order("timestamp", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LogRow[];
}
