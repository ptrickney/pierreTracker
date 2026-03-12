import { getSupabase } from "./supabase";
import type { LogRow } from "@/types/log";

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
