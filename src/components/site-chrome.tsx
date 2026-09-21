"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";

export function Header() {
  const { t } = useI18n();
  const links = [
    { href: "/search", label: t.nav.search },
    { href: "/recent", label: t.nav.recent },
    { href: "/admin", label: t.nav.admin },
    { href: "/pricing", label: t.nav.pricing },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <span className="story-ring inline-flex h-8 w-8 rounded-full p-[2px]">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-background text-xs">
              СА
            </span>
          </span>
          <span className="truncate">{t.appName}</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:px-3"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground">
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/" className="hover:text-foreground">
            {t.footer.watchAnon}
          </Link>
          <Link href="/search" className="hover:text-foreground">
            {t.footer.onlineFree}
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            {t.nav.pricing}
          </Link>
        </nav>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>{t.footer.publicOnly}</p>
          <p>{t.footer.noPrivate}</p>
        </div>
      </div>
    </footer>
  );
}
