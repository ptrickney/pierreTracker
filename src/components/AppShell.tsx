"use client";

import { SerwistProvider } from "@serwist/next/react";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/sw.js"
      disable={process.env.NODE_ENV === "development"}
    >
      <ThemeProvider>{children}</ThemeProvider>
    </SerwistProvider>
  );
}
