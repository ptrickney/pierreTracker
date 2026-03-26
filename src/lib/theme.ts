export const THEME_STORAGE_KEY = "pierre-tracker-theme";

/** Local night window: 9pm–7am (inclusive start, exclusive end on the clock). */
export const NIGHT_START_HOUR = 21;
export const NIGHT_END_HOUR = 7;

export type ThemePreference = "auto" | "light" | "dark";

export function parseThemePreference(raw: string | null): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "auto") return raw;
  return "auto";
}

export function isScheduledNight(date = new Date()): boolean {
  const h = date.getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

export function getEffectiveDark(
  preference: ThemePreference,
  date = new Date()
): boolean {
  if (preference === "dark") return true;
  if (preference === "light") return false;
  return isScheduledNight(date);
}

export function applyDarkClassToDocument(
  preference: ThemePreference,
  date = new Date()
): boolean {
  const dark = getEffectiveDark(preference, date);
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", dark);
  }
  return dark;
}

/** Inline script for layout: must match `getEffectiveDark` / `parseThemePreference`. */
export function getThemeBootScript(): string {
  const k = JSON.stringify(THEME_STORAGE_KEY);
  return `(function(){var k=${k};var p=null;try{p=localStorage.getItem(k);}catch(e){}function parse(x){if(x==="light"||x==="dark"||x==="auto")return x;return"auto";}p=parse(p);var h=new Date().getHours();var scheduled=h>=${NIGHT_START_HOUR}||h<${NIGHT_END_HOUR};var dark=p==="dark"?!0:p==="light"?!1:scheduled;document.documentElement.classList.toggle("dark",dark);})();`;
}
