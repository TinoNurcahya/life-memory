"use client";

import Link from "next/link";
import { ArrowLeft, Moon, Sun, Compass } from "lucide-react";
import { ThemeProvider, useTheme } from "@/lib/experience/theme-context";
import { SiteFooter } from "@/components/navigation/SiteFooter";

function EditorialHeader() {
  const { theme, mounted, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-hairline/80 bg-surface/90 px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Landing</span>
        </Link>
        <span className="h-3.5 w-px bg-hairline" />
        <Link href="/" className="flex items-center gap-2 text-foreground font-serif text-sm font-medium">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-brand/10 font-mono text-[9px] font-bold text-brand">LM</span>
          <span>Life Memory</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard?demo=jimmy"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-brand/20 bg-brand/5 px-2.5 py-1 font-mono text-xs text-brand transition hover:bg-brand/10"
        >
          <Compass className="h-3 w-3" />
          <span>Demo</span>
        </Link>
        <Link
          href="/login"
          className="font-mono text-xs text-muted hover:text-foreground transition"
        >
          Sign In
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-muted hover:bg-surface-subdued hover:text-foreground transition"
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4 text-accent-gold" /> : <Moon className="h-4 w-4 text-brand" />}
        </button>
      </div>
    </header>
  );
}

export function EditorialShell({
  children,
  badge,
  title,
  subtitle,
  lastUpdated,
}: {
  children: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated?: string;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-canvas text-foreground flex flex-col justify-between">
        <div>
          <EditorialHeader />
          <main className="mx-auto max-w-4xl px-4 py-12 sm:px-8 sm:py-16">
            {/* Header section */}
            <header className="mb-12 border-b border-hairline/80 pb-8">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-brand/20 bg-brand/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
                  {badge}
                </span>
                {lastUpdated && (
                  <span className="font-mono text-[11px] text-faint">
                    Effective: {lastUpdated}
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-normal tracking-tight text-foreground leading-[1.15]">
                {title}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted font-sans leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            </header>

            {/* Content body */}
            <article className="prose prose-neutral dark:prose-invert max-w-none font-sans leading-relaxed">
              {children}
            </article>
          </main>
        </div>

        <SiteFooter />
      </div>
    </ThemeProvider>
  );
}
