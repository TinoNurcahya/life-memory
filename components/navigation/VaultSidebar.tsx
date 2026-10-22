"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
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
      {/* Background squircle */}
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
      {/* Eight-pointed Life Memory starburst */}
      <g stroke="#F5F3EF" strokeWidth="2.2" strokeLinecap="round">
        <line x1="16" y1="7" x2="16" y2="25" />
        <line x1="7" y1="16" x2="25" y2="16" />
        <line x1="9.6" y1="9.6" x2="22.4" y2="22.4" />
        <line x1="22.4" y1="9.6" x2="9.6" y2="22.4" />
      </g>
      {/* Warm terracotta / amber central core */}
      <circle cx="16" cy="16" r="2.2" fill="#D97706" />
    </svg>
  );
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  badgeTone?: "accent" | "muted";
  dormantDot?: boolean;
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
      { label: "People", href: "/people", icon: Users, badge: "5", badgeTone: "muted" },
      { label: "Places", href: "/places", icon: MapPin, badge: "7", badgeTone: "muted" },
      { label: "Topics", href: "/topics", icon: Tag, badge: "8", badgeTone: "muted" },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "Ask Memory", href: "/chat", icon: MessageSquare, badge: "✦", badgeTone: "accent" },
      { label: "Pattern Insights", href: "/insights", icon: TrendingUp },
      { label: "Monthly Reflection", href: "/reflection", icon: BookOpen },
      { label: "Forgotten Memory", href: "/forgot-this", icon: Compass, dormantDot: true },
    ],
  },
];

interface VaultSidebarProps {
  variant?: "default" | "dashboard";
  isDemo?: boolean;
  userName?: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSearch?: () => void;
}

export function VaultSidebar({
  variant = "default",
  isDemo = false,
  userName,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: VaultSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, mounted, toggleTheme } = useTheme();

  const displayName = isDemo ? "Jimmy" : userName || "Archivist";
  const suffix = isDemo ? "?demo=jimmy" : "";

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

  if (variant === "dashboard") {
    return (
      <DashboardSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={onToggleCollapse}
        onCloseMobile={onCloseMobile}
        displayName={displayName}
        suffix={suffix}
        isItemActive={isItemActive}
        isDark={mounted && resolvedTheme === "dark"}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        isDemo={isDemo}
      />
    );
  }

  const sidebarContent = (
    <div
      className={`lm-sidebar-surface flex h-full flex-col justify-between overflow-hidden font-sans select-none whitespace-nowrap ${
        collapsed ? "w-16" : "w-64 min-w-[16rem]"
      }`}
    >
      {/* 1. TOP SECTION: Brand Header (Sticky / Shrink-0) */}
      <div className="shrink-0 whitespace-nowrap">
        <div
          className={`lm-sidebar-header flex items-center border-b border-sidebar-border px-3.5 py-3.5 whitespace-nowrap ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0 whitespace-nowrap">
              <Link
                href={isDemo ? "/dashboard?demo=jimmy" : "/dashboard"}
                title="Life Memory — Dashboard"
                className="flex h-8 w-8 shrink-0 items-center justify-center transition-transform hover:scale-105"
              >
                <LifeMemoryLogo className="h-8 w-8 shadow-2xs" />
              </Link>
              <div className="min-w-0 whitespace-nowrap">
                <Link
                  href={isDemo ? "/dashboard?demo=jimmy" : "/dashboard"}
                  className="font-serif text-[15px] font-semibold tracking-tight text-foreground truncate block hover:text-brand transition-colors whitespace-nowrap"
                >
                  Life Memory
                </Link>
                <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      isDemo ? "bg-accent-gold" : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  <span className="font-mono text-[12px] text-muted uppercase tracking-wider font-medium whitespace-nowrap">
                    {isDemo ? "Personal Archive" : "Active Vault"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed State: Logo morphs into Expand Button on hover */
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expand sidebar (⌘B)"
              className="group relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer"
            >
              {/* Official Logo (fades out on hover) */}
              <div className="transition-all duration-200 group-hover:scale-90 group-hover:opacity-0">
                <LifeMemoryLogo className="h-8 w-8 shadow-2xs" />
              </div>
              {/* Morph into Expand button on hover */}
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-brand/15 text-accent-gold border border-accent-gold/40 opacity-0 transition-all duration-200 group-hover:opacity-100 shadow-2xs">
                <PanelLeft className="h-4 w-4" />
              </div>
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar (⌘B)"
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-muted/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="flex md:hidden h-7 w-7 items-center justify-center rounded-lg text-muted/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: Scrollable Nav Groups (Flex-1) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden lm-vault-sidebar__scroll px-2.5 py-3 space-y-3.5 whitespace-nowrap">
        {NAV_GROUPS.map((group) => (
          <div key={group.group} className="space-y-0.5 whitespace-nowrap">
            {!collapsed && (
              <div className="px-2.5 pt-1.5 pb-0.5 whitespace-nowrap">
                <p className="lm-sidebar-group__label font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-muted/80 whitespace-nowrap">
                  {group.group}
                </p>
              </div>
            )}
            <div className="space-y-0.5 whitespace-nowrap">
              {group.items.map((item) => {
                const active = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href + suffix}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`lm-sidebar-item group relative flex items-center rounded-xl border transition-all duration-150 whitespace-nowrap ${
                      collapsed
                        ? "h-9 w-9 justify-center mx-auto"
                        : "justify-between px-3 py-1.5 text-[13.5px]"
                    } ${
                      active
                        ? "lm-sidebar-item--active font-semibold text-foreground shadow-2xs"
                        : "border-transparent text-muted font-medium hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 whitespace-nowrap">
                      {/* Warm gold indicator bar on active item */}
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-accent-gold shadow-[0_0_8px_rgba(180,83,9,0.5)]" />
                      )}
                      <Icon
                        className={`lm-sidebar-item__icon h-4 w-4 shrink-0 transition-transform duration-150 ${
                          active
                            ? "text-accent-gold scale-105"
                            : "text-muted/80 group-hover:text-foreground group-hover:scale-105"
                        }`}
                      />
                      {!collapsed && (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="lm-sidebar-item__label truncate tracking-tight whitespace-nowrap">
                            {item.label}
                          </span>
                          {item.dormantDot && (
                            <span
                              title="Dormant traces available"
                              className="h-1.5 w-1.5 rounded-full bg-amber-500/80 shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`lm-sidebar-item__badge rounded-md px-1.5 py-0.5 font-mono text-[12px] font-medium shrink-0 whitespace-nowrap ${
                          item.badgeTone === "muted"
                            ? "border border-sidebar-border bg-surface-subdued/60 text-muted"
                            : "border border-accent-gold/40 bg-brand/15 text-accent-gold font-semibold"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Small Active Pip for Collapsed State */}
                    {collapsed && active && (
                      <span className="absolute -left-1.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-gold shadow-[0_0_8px_rgba(180,83,9,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. BOTTOM SECTION: Quick Actions on Top + Pinned User Profile as Bottom Anchor */}
      <div className="shrink-0 border-t border-sidebar-border p-2.5 bg-sidebar/95 backdrop-blur-xs space-y-2 whitespace-nowrap">
        {/* Quick Actions (Settings, Appearance, Logout) */}
        <div className="space-y-0.5 whitespace-nowrap">
          {/* Settings */}
          <Link
            href={"/settings" + suffix}
            onClick={onCloseMobile}
            title={collapsed ? "Settings" : undefined}
            className={`lm-sidebar-item flex items-center rounded-xl border transition-all duration-150 whitespace-nowrap ${
              collapsed
                ? "h-8 w-8 justify-center mx-auto"
                : "gap-2.5 px-2.5 py-1.5 text-[13px]"
            } ${
              pathname.startsWith("/settings")
                ? "lm-sidebar-item--active font-semibold text-foreground shadow-2xs"
                : "border-transparent text-muted font-medium hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="font-medium text-[13px] whitespace-nowrap">Settings & Data</span>}
          </Link>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={collapsed ? `Theme: ${mounted && theme === "dark" ? "Dark" : "Light"}` : undefined}
            className={`lm-sidebar-item flex w-full items-center rounded-xl border border-transparent text-muted font-medium hover:text-foreground transition-all duration-150 cursor-pointer whitespace-nowrap ${
              collapsed
                ? "h-8 w-8 justify-center mx-auto"
                : "justify-between px-2.5 py-1.5 text-[13px]"
            }`}
          >
            <div className="flex items-center gap-2.5 whitespace-nowrap">
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4 text-accent-gold shrink-0" />
              ) : (
                <Moon className="h-4 w-4 text-brand shrink-0" />
              )}
              {!collapsed && <span className="font-medium text-[13px] whitespace-nowrap">Appearance</span>}
            </div>
            {!collapsed && (
              <span className="font-mono text-[12px] text-muted capitalize px-2 py-0.5 rounded border border-sidebar-border bg-surface-subdued/50 font-medium shrink-0 whitespace-nowrap">
                {mounted ? theme : "Auto"}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? (isDemo ? "Exit Demo" : "Log out") : undefined}
            className={`lm-sidebar-item flex w-full items-center rounded-xl border border-transparent text-muted font-medium hover:bg-rose-500/10 hover:text-rose-600 dark:hover:bg-rose-500/15 transition-all duration-150 cursor-pointer whitespace-nowrap ${
              collapsed
                ? "h-8 w-8 justify-center mx-auto"
                : "gap-2.5 px-2.5 py-1.5 text-[13px]"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="font-medium text-[13px] whitespace-nowrap">{isDemo ? "Exit Demo" : "Log out"}</span>}
          </button>
        </div>

        {/* Subtle Hairline Divider separating actions from Profile Anchor */}
        <div className="h-px bg-sidebar-border/80 my-1" />

        {/* User Profile Card Anchor (at the very bottom) */}
        {!collapsed ? (
          <div className="lm-sidebar-profile flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-surface/85 p-2 shadow-2xs backdrop-blur-xs transition hover:border-brand/35 whitespace-nowrap">
            <div className="flex items-center gap-2.5 min-w-0 whitespace-nowrap">
              <div className="relative flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-amber-600/15 text-amber-700 dark:text-amber-400 border border-amber-600/35 ring-2 ring-amber-600/20 font-mono text-[12px] font-semibold">
                {displayName.charAt(0).toUpperCase()}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-surface ${
                    isDemo ? "bg-accent-gold" : "bg-emerald-500"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1 whitespace-nowrap">
                <p className="truncate text-[13.5px] font-semibold text-foreground tracking-tight whitespace-nowrap">{displayName}</p>
                <p className="truncate font-mono text-[12px] text-muted/80 whitespace-nowrap">
                  {isDemo ? "NYU Senior · 48 traces" : "Encrypted local vault"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div
              title={`${displayName} (${isDemo ? "NYU Senior · 48 traces" : "Encrypted Vault"})`}
              className="relative flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-amber-600/15 text-amber-700 dark:text-amber-400 border border-amber-600/35 ring-2 ring-amber-600/20 font-mono text-[12px] font-semibold"
            >
              {displayName.charAt(0).toUpperCase()}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-surface ${
                  isDemo ? "bg-accent-gold" : "bg-emerald-500"
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`lm-vault-sidebar hidden md:flex flex-col shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out z-30 select-none overflow-hidden whitespace-nowrap ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-Over Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="lm-vault-sidebar relative flex w-72 max-w-[85vw] flex-col bg-sidebar border-r border-sidebar-border shadow-2xl z-10 animate-in slide-in-from-left duration-200 overflow-hidden whitespace-nowrap">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

interface DashboardSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  displayName: string;
  suffix: string;
  isItemActive: (href: string) => boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => Promise<void>;
  isDemo: boolean;
}

function DashboardSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  displayName,
  suffix,
  isItemActive,
  isDark,
  onToggleTheme,
  onLogout,
  isDemo,
}: DashboardSidebarProps) {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    drawerRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => previousFocus?.focus();
  }, [mobileOpen]);

  const content = (compact: boolean, mobile = false) => (
    <>
      <div className={styles.sidebarBrand}>
        <Link href={"/dashboard" + suffix} className={styles.brandLink} aria-label="Life Memory dashboard" onClick={onCloseMobile}>
          <LifeMemoryLogo className="h-7 w-7" />
          {!compact && <span>Life Memory</span>}
        </Link>
        <button
          type="button"
          className={styles.iconButton}
          onClick={mobile ? onCloseMobile : onToggleCollapse}
          aria-label={mobile ? "Close navigation" : compact ? "Expand sidebar" : "Collapse sidebar"}
          title={mobile ? "Close navigation" : `${compact ? "Expand" : "Collapse"} sidebar (Ctrl/Cmd+B)`}
        >
          {mobile ? <X size={18} /> : compact ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className={styles.sidebarNavigation} aria-label="Main navigation">
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
                  onClick={onCloseMobile}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                  aria-current={active ? "page" : undefined}
                  aria-label={compact ? item.label : undefined}
                  title={compact ? item.label : undefined}
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
        <Link href={"/settings" + suffix} className={styles.navItem} aria-label={compact ? "Settings & Data" : undefined} title={compact ? "Settings & Data" : undefined} onClick={onCloseMobile}>
          <Settings size={17} aria-hidden="true" />
          {!compact && <span>Settings &amp; Data</span>}
        </Link>
        <button type="button" className={styles.navItem} onClick={onToggleTheme} aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} title={compact ? "Appearance" : undefined}>
          {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          {!compact && <span>Appearance</span>}
        </button>
        <button type="button" className={styles.navItem} onClick={onLogout} aria-label={compact ? (isDemo ? "Exit Demo" : "Log out") : undefined} title={compact ? (isDemo ? "Exit Demo" : "Log out") : undefined}>
          <LogOut size={17} aria-hidden="true" />
          {!compact && <span>{isDemo ? "Exit Demo" : "Log out"}</span>}
        </button>
        <div className={styles.profile} title={compact ? displayName : undefined}>
          <span className={styles.avatar} aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
          {!compact && <span>{displayName}</span>}
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        {content(collapsed)}
      </aside>
      {mobileOpen && (
        <div className={styles.drawerOverlay}>
          <div className={styles.drawerBackdrop} onClick={onCloseMobile} aria-hidden="true" />
          <aside
            ref={drawerRef}
            className={styles.mobileDrawer}
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
