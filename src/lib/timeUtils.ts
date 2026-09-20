/** Rounds a Date down to the nearest 15-minute mark (e.g. 16:07 → 16:00). */
export function roundDownTo15Minutes(date: Date): Date {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  rounded.setMinutes(Math.floor(minutes / 15) * 15, 0, 0);
  return rounded;
}

function formatHHMM(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Returns "HH:MM" for (now - 15 minutes) rounded down to nearest 15 minutes. */
export function getDefaultEventTime(now: Date = new Date()): string {
  const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
  return formatHHMM(roundDownTo15Minutes(fifteenMinAgo));
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

/** Returns all "HH:MM" values in 15-minute increments from 00:00 to 23:45. */
export function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      options.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return options;
}
