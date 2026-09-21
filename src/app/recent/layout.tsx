import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Недавние запросы",
  robots: { index: false, follow: false },
};

export default function RecentLayout({ children }: { children: ReactNode }) {
  return children;
}
