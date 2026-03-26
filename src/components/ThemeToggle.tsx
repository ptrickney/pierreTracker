"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { preference, effectiveDark, setLight, setDark, resetToAuto } =
    useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cycle = () => {
    if (effectiveDark) setLight();
    else setDark();
  };

  return (
    <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      {mounted && preference !== "auto" && (
        <button
          type="button"
          onClick={resetToAuto}
          className="text-xs font-medium text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-700 dark:text-zinc-400 dark:decoration-zinc-600 dark:hover:text-zinc-200"
        >
          Use night schedule
        </button>
      )}
      <button
        type="button"
        onClick={cycle}
        className="flex h-10 min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        aria-label={
          !mounted
            ? "Theme"
            : effectiveDark
              ? "Switch to light mode"
              : "Switch to dark mode"
        }
        title={
          !mounted
            ? "Theme"
            : preference === "auto"
              ? effectiveDark
                ? "Dark (scheduled). Click for light."
                : "Light (scheduled). Click for dark."
              : effectiveDark
                ? "Dark mode on. Click for light."
                : "Light mode on. Click for dark."
        }
      >
        {!mounted ? (
          <Moon className="h-5 w-5 text-indigo-500" aria-hidden />
        ) : effectiveDark ? (
          <Sun className="h-5 w-5 text-amber-400" aria-hidden />
        ) : (
          <Moon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" aria-hidden />
        )}
        {mounted && (
          <span className="hidden sm:inline">
            {effectiveDark ? "Light" : "Dark"}
          </span>
        )}
      </button>
    </div>
  );
}
