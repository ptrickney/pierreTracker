import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { getThemeBootScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Pierre Tracker",
  description: "Baby activity dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-100"
        suppressHydrationWarning
      >
        <Script
          id="theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getThemeBootScript() }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
