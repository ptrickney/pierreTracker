export const TREND_WINDOW_DAYS = 7;

export type TrendWindow = {
  start: Date;
  endDate: Date;
  endExclusive: Date;
  label: string;
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addLocalDays(date: Date, days: number): Date {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatWindowDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDayLabel(date: Date): string {
  const mon = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${mon} ${day.toString().padStart(2, "0")}`;
}

export function getTrendWindow(anchorDate: Date = new Date()): TrendWindow {
  const endDate = startOfLocalDay(anchorDate);
  const start = addLocalDays(endDate, -(TREND_WINDOW_DAYS - 1));
  const endExclusive = addLocalDays(endDate, 1);

  return {
    start,
    endDate,
    endExclusive,
    label: `${formatWindowDay(start)} - ${formatWindowDay(endDate)}`,
  };
}

export function getTrendLookbackStart(windowStartDate: Date): Date {
  return addLocalDays(windowStartDate, -(TREND_WINDOW_DAYS - 1));
}

export function getPreviousTrendWindowEnd(currentEndDate: Date): Date {
  return addLocalDays(currentEndDate, -1);
}

export function canGoNextTrendWindow(
  currentEndDate: Date,
  today: Date = new Date()
): boolean {
  return startOfLocalDay(currentEndDate).getTime() < startOfLocalDay(today).getTime();
}

export function getNextTrendWindowEnd(
  currentEndDate: Date,
  today: Date = new Date()
): Date {
  const nextEndDate = addLocalDays(currentEndDate, 1);
  const todayStart = startOfLocalDay(today);
  return nextEndDate.getTime() > todayStart.getTime() ? todayStart : nextEndDate;
}

export function calculateSevenDayAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / TREND_WINDOW_DAYS;
}
