"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  THEME_STORAGE_KEY,
  type ThemePreference,
  parseThemePreference,
  getEffectiveDark,
  applyDarkClassToDocument,
} from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  effectiveDark: boolean;
  setLight: () => void;
  setDark: () => void;
  resetToAuto: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

/** Optional: charts and portals that may render outside typical tree still read document class; this mirrors it for subscribers. */
export function useEffectiveDark(): boolean {
  return useTheme().effectiveDark;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    typeof window !== "undefined"
      ? parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY))
      : "auto"
  );
  const [tick, setTick] = useState(0);

  const effectiveDark = useMemo(() => {
    void tick;
    return getEffectiveDark(preference);
  }, [preference, tick]);

  useEffect(() => {
    applyDarkClassToDocument(preference);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* ignore quota / private mode */
    }
  }, [preference, effectiveDark]);

  useEffect(() => {
    if (preference !== "auto") return;
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        setPreference(parseThemePreference(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", onStorage);
    };
  }, [preference]);

  const setLight = useCallback(() => setPreference("light"), []);
  const setDark = useCallback(() => setPreference("dark"), []);
  const resetToAuto = useCallback(() => setPreference("auto"), []);

  const value = useMemo(
    () => ({
      preference,
      effectiveDark,
      setLight,
      setDark,
      resetToAuto,
    }),
    [preference, effectiveDark, setLight, setDark, resetToAuto]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
