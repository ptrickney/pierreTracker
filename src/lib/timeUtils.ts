/** Rounds a Date down to the nearest 5-minute mark (e.g. 16:07 → 16:05). */
export function roundDownTo5Minutes(date: Date): Date {
  const ms = date.getTime();
  const fiveMinMs = 5 * 60 * 1000;
  return new Date(Math.floor(ms / fiveMinMs) * fiveMinMs);
}

/** Returns "HH:MM" for (now - 15 minutes) rounded down to nearest 5 minutes. */
export function getDefaultEventTime(): string {
  const now = new Date();
  const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
  const rounded = roundDownTo5Minutes(fifteenMinAgo);
  const h = rounded.getHours();
  const m = rounded.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Returns today's date as "YYYY-MM-DD" in local timezone. */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a "YYYY-MM-DD" string into a local Date (midnight). */
export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns all "HH:MM" values in 5-minute increments from 00:00 to 23:55. */
export function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      options.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return options;
}
