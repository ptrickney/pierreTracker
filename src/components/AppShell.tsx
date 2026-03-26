"use client";

import { ThemeProvider } from "@/components/ThemeProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
