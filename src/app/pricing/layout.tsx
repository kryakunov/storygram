import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Тарифы",
  description:
    "Тарифы сервиса «Сторис анонимно». Сейчас просмотр публичных сторис без регистрации бесплатный.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children;
}
