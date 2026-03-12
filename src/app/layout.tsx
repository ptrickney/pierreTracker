import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased bg-gray-50" suppressHydrationWarning>{children}</body>
    </html>
  );
}
