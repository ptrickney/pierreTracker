import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { getThemeBootScript } from "@/lib/theme";

export const metadata: Metadata = {
  applicationName: "Pierre Tracker",
  title: "Pierre Tracker",
  description: "Baby activity dashboard",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pierre Tracker",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
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
