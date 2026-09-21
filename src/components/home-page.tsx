"use client";

import Link from "next/link";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_PROFILES } from "@/providers/catalog";
import { useI18n } from "@/components/i18n-provider";
import { translateDemo } from "@/i18n";

export function HomePage() {
  const { t } = useI18n();
  return (
    <div className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <Badge>{t.home.badge}</Badge>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight md:text-6xl">
            {t.home.headline}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{t.home.description}</p>
          <SearchForm />
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/search?u=luna.travels">{t.home.tryDemo}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/recent">{t.home.recentCta}</Link>
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t.home.demoTitle}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {DEMO_PROFILES.filter((profile) => profile.scenario !== "unavailable")
              .slice(0, 4)
              .map((profile) => (
                <Link
                  key={profile.username}
                  href={`/search?u=${profile.username}`}
                  className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 hover:bg-muted/70"
                >
                  <span>
                    <span className="block font-medium">@{profile.username}</span>
                    <span className="text-sm text-muted-foreground">
                      {translateDemo(t, "notes", profile.username, profile.notes)}
                    </span>
                  </span>
                  <Badge variant="muted">
                    {t.scenario[profile.scenario as keyof typeof t.scenario]}
                  </Badge>
                </Link>
              ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          {t.home.featuresTitle}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
        {t.home.features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.body}
            </CardContent>
          </Card>
        ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          {t.home.howTitle}
        </h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {t.home.howSteps.map((step, index) => (
            <li key={step} className="rounded-2xl border border-border bg-card p-5 text-sm">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          {t.home.limitsTitle}
        </h2>
        <p className="max-w-3xl text-muted-foreground">{t.home.limitsBody}</p>
      </section>

      <DisclaimerBanner />

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          {t.home.faqTitle}
        </h2>
        <div className="grid gap-3">
          {t.home.faq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-medium">{item.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
