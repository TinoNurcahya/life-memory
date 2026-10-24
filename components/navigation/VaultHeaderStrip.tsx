"use client";

import {
  Menu,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/experience/theme-context";
import styles from "./DashboardNavigation.module.css";

export interface VaultHeaderStripProps {
  title?: string;
  isDemo?: boolean;
  userName?: string | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenMobile: () => void;
  onOpenSearch?: () => void;
  variant?: string; // Backwards compatibility
}

export function VaultHeaderStrip({
  title = "Dashboard",
  isDemo = false,
  onOpenMobile,
  onOpenSearch,
}: VaultHeaderStripProps) {
  const { resolvedTheme, mounted, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.headerStart}>
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation"
          className={`${styles.iconButton} ${styles.mobileMenuButton}`}
        >
          <Menu size={18} aria-hidden="true" />
        </button>
        <span className={styles.headerTitle}>{title}</span>
      </div>
      <div className={styles.headerActions}>
        {isDemo && <span className={styles.demoLabel}>Fictional demo</span>}
        <button
          type="button"
          onClick={onOpenSearch}
          className={styles.searchButton}
          aria-label="Search archive"
        >
          <Search size={18} aria-hidden="true" />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${mounted && resolvedTheme === "dark" ? "light" : "dark"} mode`}
          className={styles.iconButton}
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun size={18} aria-hidden="true" />
          ) : (
            <Moon size={18} aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}
