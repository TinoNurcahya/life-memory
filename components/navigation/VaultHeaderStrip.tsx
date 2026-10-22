"use client";

import Link from "next/link";
import {
  Menu,
  Search,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/lib/experience/theme-context";
import styles from "./DashboardNavigation.module.css";

interface VaultHeaderStripProps {
  variant?: "default" | "dashboard";
  title?: string;
  isDemo?: boolean;
  userName?: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  onOpenSearch?: () => void;
}

export function VaultHeaderStrip({
  variant = "default",
  title = "Dashboard",
  isDemo = false,
  userName,
  onOpenMobile,
  onOpenSearch,
}: VaultHeaderStripProps) {
  const { theme, resolvedTheme, mounted, toggleTheme } = useTheme();
  const displayName = isDemo ? "Jimmy" : userName || "Archivist";

  if (variant === "dashboard") {
    return (
      <header className={styles.header}>
        <div className={styles.headerStart}>
          <button type="button" onClick={onOpenMobile} aria-label="Open navigation" className={`${styles.iconButton} ${styles.mobileMenuButton}`}>
            <Menu size={18} aria-hidden="true" />
          </button>
          <span className={styles.headerTitle}>{title}</span>
        </div>
        <div className={styles.headerActions}>
          {isDemo && <span className={styles.demoLabel}>Fictional demo</span>}
          <button type="button" onClick={onOpenSearch} className={styles.searchButton} aria-label="Search archive">
            <Search size={18} aria-hidden="true" />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${mounted && resolvedTheme === "dark" ? "light" : "dark"} mode`} className={styles.iconButton}>
            {mounted && resolvedTheme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="lm-vault-header sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between border-b border-hairline/80 bg-surface/85 px-4 backdrop-blur-md shadow-2xs font-sans">
      {/* Left: Toggles & Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Buka menu navigasi"
          className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-subdued hover:text-foreground transition"
        >
          <Menu className="h-4 w-4" />
        </button>



        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0 text-xs">
          <Link
            href={isDemo ? "/dashboard?demo=jimmy" : "/dashboard"}
            className="font-mono text-faint hover:text-foreground transition shrink-0"
          >
            Vault
          </Link>
          <ChevronRight className="h-3 w-3 text-hairline shrink-0" />
          <span className="font-serif font-medium text-foreground truncate">
            {title}
          </span>
        </nav>
      </div>

      {/* Right: Quick Search, Vault Pill, Theme, User Initial */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Search Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-2.5 py-1 text-xs text-muted hover:border-brand/40 hover:text-foreground transition shadow-2xs"
        >
          <Search className="h-3 w-3" />
          <span>Search</span>
          <kbd className="rounded border border-hairline/80 bg-surface-subdued px-1 font-mono text-xs text-faint">
            ⌘K
          </kbd>
        </button>

        {/* Vault Status Pill */}
        {isDemo ? (
          <span className="hidden sm:inline-block rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider text-brand">
            Demo · Jimmy
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Vault
          </span>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-muted hover:bg-surface-subdued hover:text-foreground transition"
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4 text-accent-gold" />
          ) : (
            <Moon className="h-4 w-4 text-brand" />
          )}
        </button>

        {/* User Mini Avatar */}
        <div
          title={displayName}
          className="flex h-7 w-7 select-none items-center justify-center rounded-full bg-brand/15 font-mono text-xs font-semibold text-brand ring-1 ring-hairline"
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
