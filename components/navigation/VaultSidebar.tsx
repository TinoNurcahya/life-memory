"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Users,
  MapPin,
  Tag,
  MessageSquare,
  TrendingUp,
  BookOpen,
  Compass,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { useTheme } from "@/lib/experience/theme-context";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { dashboardSans } from "@/components/dashboard/fonts";
import styles from "./DashboardNavigation.module.css";

/**
 * Official Life Memory Logo (Eight-pointed starburst in squircle with amber core)
 */
function LifeMemoryLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <rect width="32" height="32" rx="7" fill="#14171A" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="6.5"
        stroke="#FFFFFF"
        strokeOpacity="0.15"
      />
      <g stroke="#F5F3EF" strokeWidth="2.2" strokeLinecap="round">
        <line x1="16" y1="7" x2="16" y2="25" />
        <line x1="7" y1="16" x2="25" y2="16" />
        <line x1="9.6" y1="9.6" x2="22.4" y2="22.4" />
        <line x1="22.4" y1="9.6" x2="9.6" y2="22.4" />
      </g>
      <circle cx="16" cy="16" r="2.2" fill="#D97706" />
    </svg>
  );
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: "Archive",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Timeline Feed", href: "/timeline", icon: Clock },
      { label: "Visual Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    group: "Constellations",
    items: [
      { label: "People", href: "/people", icon: Users },
      { label: "Places", href: "/places", icon: MapPin },
      { label: "Topics", href: "/topics", icon: Tag },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "Ask Memory", href: "/chat", icon: MessageSquare },
      { label: "Pattern Insights", href: "/insights", icon: TrendingUp },
      { label: "Monthly Reflection", href: "/reflection", icon: BookOpen },
      { label: "Forgotten Memory", href: "/forgot-this", icon: Compass },
    ],
  },
];

export interface VaultSidebarProps {
  isDemo?: boolean;
  userName?: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  variant?: string;
  onOpenSearch?: () => void;
}

export function VaultSidebar({
  isDemo = false,
  userName,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: VaultSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, mounted, toggleTheme } = useTheme();
  const drawerRef = useRef<HTMLElement>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number; left: number } | null>(null);

  const displayName = isDemo ? "Jimmy" : userName || "Archivist";
  const suffix = isDemo ? "?demo=jimmy" : "";
  const isDark = mounted && resolvedTheme === "dark";

  const handleLogout = async () => {
    try {
      if (isDemo) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("extra_demo_memories");
        }
        toast.success("Keluar dari mode demo.");
        router.push("/");
        return;
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Berhasil keluar dari akun.");
      router.push("/");
    } catch {
      toast.error("Gagal keluar dari akun.");
    }
  };

  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const showTooltip = (label: string, e: React.MouseEvent<HTMLElement>) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const hideTooltip = () => {
    setHoveredTooltip(null);
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    drawerRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => previousFocus?.focus();
  }, [mobileOpen]);

  const content = (compact: boolean, mobile = false) => (
    <>
      <div className={styles.sidebarBrand}>
        <Link
          href={"/dashboard" + suffix}
          prefetch={true}
          className={styles.brandLink}
          aria-label="Life Memory dashboard"
          onClick={onCloseMobile}
          onMouseEnter={(e) => showTooltip("Life Memory", e)}
          onMouseLeave={hideTooltip}
        >
          <LifeMemoryLogo className="h-7 w-7" />
          {!compact && <span>Life Memory</span>}
        </Link>
        <button
          type="button"
          className={styles.iconButton}
          onClick={mobile ? onCloseMobile : onToggleCollapse}
          aria-label={mobile ? "Close navigation" : compact ? "Expand sidebar" : "Collapse sidebar"}
          title={mobile ? "Close navigation" : compact ? undefined : "Collapse sidebar (Ctrl/Cmd+B)"}
          onMouseEnter={(e) => showTooltip(compact ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)", e)}
          onMouseLeave={hideTooltip}
        >
          {mobile ? <X size={18} /> : compact ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className={styles.sidebarNavigation} aria-label="Main navigation" onScroll={hideTooltip}>
        {NAV_GROUPS.map((group) => (
          <div key={group.group} className={styles.navigationGroup}>
            {!compact && <p className={styles.groupLabel}>{group.group}</p>}
            {group.items.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href + suffix}
                  prefetch={true}
                  onClick={onCloseMobile}
                  className={cn(styles.navItem, active && styles.navItemActive)}
                  aria-current={active ? "page" : undefined}
                  aria-label={compact ? item.label : undefined}
                  onMouseEnter={(e) => showTooltip(item.label, e)}
                  onMouseLeave={hideTooltip}
                >
                  <Icon size={17} aria-hidden="true" />
                  {!compact && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link
          href={"/settings" + suffix}
          prefetch={true}
          className={cn(styles.navItem, isItemActive("/settings") && styles.navItemActive)}
          aria-label={compact ? "Settings & Data" : undefined}
          onClick={onCloseMobile}
          onMouseEnter={(e) => showTooltip("Settings & Data", e)}
          onMouseLeave={hideTooltip}
        >
          <Settings size={17} aria-hidden="true" />
          {!compact && <span>Settings &amp; Data</span>}
        </Link>
        <button
          type="button"
          className={styles.navItem}
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          onMouseEnter={(e) => showTooltip(isDark ? "Light mode" : "Dark mode", e)}
          onMouseLeave={hideTooltip}
        >
          {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          {!compact && <span>Appearance</span>}
        </button>
        <button
          type="button"
          className={styles.navItem}
          onClick={handleLogout}
          aria-label={compact ? (isDemo ? "Exit Demo" : "Log out") : undefined}
          onMouseEnter={(e) => showTooltip(isDemo ? "Exit Demo" : "Log out", e)}
          onMouseLeave={hideTooltip}
        >
          <LogOut size={17} aria-hidden="true" />
          {!compact && <span>{isDemo ? "Exit Demo" : "Log out"}</span>}
        </button>
        <div
          className={styles.profile}
          onMouseEnter={(e) => showTooltip(displayName, e)}
          onMouseLeave={hideTooltip}
        >
          <span className={styles.avatar} aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
          {!compact && <span>{displayName}</span>}
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className={cn(styles.sidebar, dashboardSans.variable, collapsed && styles.sidebarCollapsed)} onMouseLeave={hideTooltip}>
        {content(collapsed)}
      </aside>
      {collapsed && hoveredTooltip && (
        <div
          role="tooltip"
          aria-hidden="true"
          className="pointer-events-none fixed z-[99999] -translate-y-1/2 flex items-center animate-in fade-in zoom-in-95 duration-150"
          style={{ top: hoveredTooltip.top, left: hoveredTooltip.left }}
        >
          <div className="rounded-md border border-border-hairline bg-surface/95 px-2.5 py-1 text-[12px] font-medium tracking-tight text-foreground shadow-xl backdrop-blur-md whitespace-nowrap">
            {hoveredTooltip.label}
          </div>
        </div>
      )}
      {mobileOpen && (
        <div className={styles.drawerOverlay}>
          <div className={styles.drawerBackdrop} onClick={onCloseMobile} aria-hidden="true" />
          <aside
            ref={drawerRef}
            className={cn(styles.mobileDrawer, dashboardSans.variable)}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onCloseMobile();
              }
              if (event.key !== "Tab") return;
              const controls = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
              if (!controls?.length) return;
              const first = controls[0];
              const last = controls[controls.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            {content(false, true)}
          </aside>
        </div>
      )}
    </>
  );
}
