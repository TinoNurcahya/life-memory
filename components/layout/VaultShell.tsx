"use client";

import { useState, useEffect, ReactNode } from "react";
import { ThemeProvider } from "@/lib/experience/theme-context";
import { VaultSidebar } from "@/components/navigation/VaultSidebar";
import { VaultHeaderStrip } from "@/components/navigation/VaultHeaderStrip";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import type { TimelineItem } from "@/lib/queries/activities";
import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";

interface VaultShellProps {
  children: ReactNode;
  title?: string;
  isDemo?: boolean;
  userName?: string | null;
  items?: TimelineItem[];
  showHeader?: boolean;
  editorial?: boolean;
  variant?: "default" | "dashboard";
  className?: string;
}

function VaultShellInner({
  children,
  title = "Dashboard",
  isDemo = false,
  userName,
  items,
  showHeader = true,
  editorial = false,
  variant = "default",
  className = "",
}: VaultShellProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("lm_sidebar_collapsed") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("lm_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B for collapsing sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openSearch = () => {
    // Dispatch a synthetic ⌘K key event to trigger CommandPalette
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      })
    );
  };

  return (
    <div className={`relative flex h-screen w-full overflow-hidden bg-canvas text-foreground transition-colors duration-300 ${editorial ? "lm-vault-shell--editorial" : ""} ${variant === "dashboard" ? "lm-vault-shell--dashboard" : ""} ${className}`}>
      {/* Ambient Oceanic Glow - Isolated & Hardware Accelerated */}
      {variant !== "dashboard" && <div className="pointer-events-none fixed inset-0 overflow-hidden transform-gpu will-change-transform" aria-hidden="true">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-brand/10 blur-[120px] transform-gpu" />
        <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[130px] transform-gpu" />
        <div className="absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-accent-gold/5 blur-[120px] transform-gpu" />
      </div>}

      {/* Persistent Left Sidebar */}
      <VaultSidebar
        variant={variant}
        isDemo={isDemo}
        userName={userName}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onOpenSearch={openSearch}
      />

      {/* Main App Frame */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {showHeader && (
          <VaultHeaderStrip
            variant={variant}
            title={title}
            isDemo={isDemo}
            userName={userName}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            onOpenMobile={() => setMobileOpen(true)}
            onOpenSearch={openSearch}
          />
        )}

        {/* Scrollable Content Viewport - Stabilized & GPU accelerated */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain min-w-0 transform-gpu [scrollbar-gutter:stable]">
          {children}
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette items={items || (isDemo ? JIMMY_DEMO_ITEMS : [])} demo={isDemo} variant={variant} showFloatingTrigger={variant !== "dashboard"} />
    </div>
  );
}

export function VaultShell(props: VaultShellProps) {
  return (
    <ThemeProvider>
      <VaultShellInner {...props} />
    </ThemeProvider>
  );
}
