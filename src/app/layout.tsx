import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ordit — Trusted AI Consensus for Business Insights",
  description:
    "Ordit uses GenLayer Intelligent Contracts to determine whether AI-generated insights are actually supported by the underlying data.",
  keywords: ["AI audit", "GenLayer", "business intelligence", "insight verification", "consensus"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
