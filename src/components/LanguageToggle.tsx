"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { t, toggleLocale } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="flex h-10 min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      aria-label={t.languageToggle.switchTo}
      title={t.languageToggle.switchTo}
    >
      <Languages className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden />
      {mounted && <span className="hidden sm:inline">{t.languageToggle.targetCode}</span>}
    </button>
  );
}
