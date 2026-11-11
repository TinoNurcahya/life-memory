"use client";

import Link from "next/link";
import { ArrowLeft, Moon, Sun, Compass } from "lucide-react";
import { ThemeProvider, useTheme } from "@/lib/experience/theme-context";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import "@/components/dashboard/dashboard.css";
import styles from "./About.module.css";

function EditorialHeader() {
  const { resolvedTheme, mounted, setTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className={styles.topHeader}>
      <div className={styles.topHeaderInner}>
        <div className={styles.topHeaderLeft}>
          <Link href="/" className={styles.backNavLink}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Landing</span>
          </Link>
          <span className={styles.headerDivider} aria-hidden="true" />
          <Link href="/dashboard?demo=jimmy" className={styles.brandLink}>
            <span className={styles.brandMark}>LM</span>
            <span>Life Memory</span>
          </Link>
        </div>

        <nav aria-label="Editorial navigation" className={styles.topNavLinks}>
          <Link href="/about" className={styles.topNavLink}>
            Philosophy
          </Link>
          <Link href="/privacy" className={styles.topNavLink}>
            Privacy
          </Link>
          <Link href="/terms" className={styles.topNavLink}>
            Terms
          </Link>
          <Link href="/faq" className={styles.topNavLink}>
            FAQ
          </Link>
          <Link href="/sitemap" className={styles.topNavLink}>
            Sitemap
          </Link>
        </nav>

        <div className={styles.topHeaderRight}>
          <Link href="/dashboard?demo=jimmy" className={styles.demoPillLink}>
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Open Demo</span>
          </Link>
          <Link href="/login" className={styles.signInNavLink}>
            Sign in
          </Link>
          <button
            type="button"
            onClick={(event) => setTheme(isDark ? "light" : "dark", event)}
            aria-label={
              isDark
                ? "Switch to Warm Paper light theme"
                : "Switch to Quiet Night dark theme"
            }
            title={isDark ? "Warm Paper (Light)" : "Quiet Night (Dark)"}
            className={styles.headerThemeBtn}
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
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
  wide = false,
}: {
  children: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  wide?: boolean;
}) {
  return (
    <ThemeProvider>
      <div
        className={`min-h-screen bg-canvas text-foreground flex flex-col justify-between lm-vault-shell--dashboard font-sans ${dashboardSans.variable} ${dashboardSerif.variable}`}
      >
        <div>
          <EditorialHeader />
          <main className={wide ? styles.pageWide : styles.pageStandard}>
            {/* Editorial Intro — Identical to /settings & /dashboard */}
            <header className={styles.intro}>
              <div className={styles.heading}>
                <h1>{title}</h1>
                <span>{badge} · Personal Memory Intelligence</span>
              </div>
              <div className={styles.introBottom}>
                <p>{subtitle}</p>
                <div className={styles.leadMeta}>
                  {lastUpdated && <span>Edition · {lastUpdated}</span>}
                  <span>Zero Model Training · 100% Portable JSON</span>
                </div>
              </div>
            </header>

            <article className={styles.articleBody}>{children}</article>
          </main>
        </div>

        <SiteFooter />
      </div>
    </ThemeProvider>
  );
}
