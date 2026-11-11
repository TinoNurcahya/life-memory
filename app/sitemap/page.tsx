import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarDays,
  Compass,
  HelpCircle,
  Lock,
  Map,
  MapPin,
  MessageSquare,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import styles from "@/components/editorial/About.module.css";

export const metadata: Metadata = {
  title: "Visual User Sitemap & Directory · Life Memory",
  description:
    "Complete 18-route architectural directory of all public narrative pages, personal archive workspaces, AI intelligence views, and legal disclosures in Life Memory.",
};

interface DirectoryPageItem {
  title: string;
  path: string;
  demoPath?: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DirectorySection {
  indexLabel: string;
  title: string;
  lead: string;
  metaBadge: string;
  pages: DirectoryPageItem[];
}

const DIRECTORY: DirectorySection[] = [
  {
    indexLabel: "01 — Public Narrative",
    title: "Story & Knowledge Base",
    lead: "Editorial entry points explaining the origin story, architecture, and frequently asked questions behind Life Memory.",
    metaBadge: "4 Public Routes",
    pages: [
      {
        title: "Editorial Landing Story",
        path: "/",
        description:
          "Interactive paper-and-ink narrative introducing ordinary days, memory reconstruction, constellations, and rediscovery.",
        badge: "Public",
        icon: Compass,
      },
      {
        title: "Origin & Philosophy",
        path: "/about",
        description:
          "Hermann Ebbinghaus's forgetting curve, the 4D living constellation specimen, and our Ethical AI Charter.",
        badge: "Public",
        icon: BookOpen,
      },
      {
        title: "Frequently Asked Questions",
        path: "/faq",
        description:
          "Categorized Q-01 to Q-12 knowledge base covering Gemini grounding, Row-Level Security, and JSON portability.",
        badge: "Public",
        icon: HelpCircle,
      },
      {
        title: "Visual User Sitemap",
        path: "/sitemap",
        description:
          "Complete architectural index of all 18 routes across public, workspace, AI intelligence, and governance layers.",
        badge: "Directory",
        icon: Map,
      },
    ],
  },
  {
    indexLabel: "02 — Archive Workspace",
    title: "Personal Vault & Constellations",
    lead: "The core daily workspace where natural-language memories are captured, browsed chronologically, and indexed across people, places, and topics.",
    metaBadge: "6 Workspace Routes",
    pages: [
      {
        title: "Archive Dashboard",
        path: "/dashboard",
        demoPath: "/dashboard?demo=jimmy",
        description:
          "Central workspace featuring the playing-card fan entrance, Quick Logger (<100ms capture), S-14 reveal card, and activity index.",
        badge: "Vault Core",
        icon: Compass,
      },
      {
        title: "Chronological Timeline",
        path: "/timeline",
        demoPath: "/timeline?demo=jimmy",
        description:
          "Full chronological feed of logged memories with instant search, category filters, and inline entity editing.",
        badge: "Vault Core",
        icon: Calendar,
      },
      {
        title: "Visual Calendar",
        path: "/calendar",
        demoPath: "/calendar?demo=jimmy",
        description:
          "Monthly photographic and activity calendar grid highlighting active days, category distributions, and daily memory inspection.",
        badge: "Vault Core",
        icon: CalendarDays,
      },
      {
        title: "People Constellation",
        path: "/people",
        demoPath: "/people?demo=jimmy",
        description:
          "Personal directory of friends, family, and collaborators automatically extracted from your notes, with shared timeline drill-downs.",
        badge: "Constellation",
        icon: Users,
      },
      {
        title: "Places Directory",
        path: "/places",
        demoPath: "/places?demo=jimmy",
        description:
          "Geographic index of cafes, studios, neighborhoods, and cities appearing in your memories, tracking first and recent visits.",
        badge: "Constellation",
        icon: MapPin,
      },
      {
        title: "Topics & Skills Index",
        path: "/topics",
        demoPath: "/topics?demo=jimmy",
        description:
          "Longitudinal catalogue of skills, books, creative projects, and recurring curiosities pursued across months.",
        badge: "Constellation",
        icon: Tag,
      },
    ],
  },
  {
    indexLabel: "03 — Memory Intelligence",
    title: "Recall, Patterns & Reflection",
    lead: "Evidence-backed pattern discovery, deterministic forgotten-memory resurfacing, and footnote-grounded narrative synthesis.",
    metaBadge: "4 Intelligence Routes",
    pages: [
      {
        title: "Ask Memory (Conversational Recall)",
        path: "/chat",
        demoPath: "/chat?demo=jimmy",
        description:
          "Natural-language memory Q&A that answers questions about your past strictly using cited records from your archive.",
        badge: "AI Recall",
        icon: MessageSquare,
      },
      {
        title: "Pattern Insights & Evidence Drawer",
        path: "/insights",
        demoPath: "/insights?demo=jimmy",
        description:
          "Automated discovery of first-time experiences, recurring habits, and monthly shifts—each linked to verifiable source notes.",
        badge: "Analytics",
        icon: TrendingUp,
      },
      {
        title: "Monthly Footnote Reflection",
        path: "/reflection",
        demoPath: "/reflection?demo=jimmy",
        description:
          "Editorial monthly essay synthesized from your logged activities with interactive [1]..[N] footnote citations.",
        badge: "AI Essay",
        icon: BookOpen,
      },
      {
        title: "You Probably Forgot This (S-14)",
        path: "/forgot-this",
        demoPath: "/forgot-this?demo=jimmy",
        description:
          "100% deterministic rediscovery engine surfacing meaningful memories whose people or places have been dormant for 21+ days.",
        badge: "Deterministic",
        icon: Sparkles,
      },
    ],
  },
  {
    indexLabel: "04 — Governance & Access",
    title: "Settings, Auth & Legal Charter",
    lead: "Theme customization, 1-click JSON data sovereignty export, authentication flows, and public legal disclosures.",
    metaBadge: "6 System Routes",
    pages: [
      {
        title: "Settings & Data Sovereignty",
        path: "/settings",
        demoPath: "/settings?demo=jimmy",
        description:
          "2-Column editorial configuration for Warm Paper / Quiet Night themes, archive inventory metrics, and 1-click JSON export.",
        badge: "Settings",
        icon: Settings,
      },
      {
        title: "Sign In to Archive",
        path: "/login",
        description:
          "Editorial split-screen sign-in supporting email & password, direct Google OAuth, and instant Demo Vault access.",
        badge: "Auth",
        icon: Lock,
      },
      {
        title: "Create New Archive",
        path: "/register",
        description:
          "Start a new private cloud archive backed by Supabase PostgreSQL Row-Level Security.",
        badge: "Auth",
        icon: UserPlus,
      },
      {
        title: "Privacy Policy",
        path: "/privacy",
        description:
          "GDPR/CCPA disclosures, zero AI model training guarantee, and cryptographic tenant isolation specifications.",
        badge: "Legal",
        icon: ShieldCheck,
      },
      {
        title: "Terms of Service",
        path: "/terms",
        description:
          "100% author copyright retention, scoped operational license, and unconditional data portability terms.",
        badge: "Legal",
        icon: Scale,
      },
      {
        title: "AI Safety & Disclaimer",
        path: "/disclaimer",
        description:
          "Non-clinical boundaries, mental health helpline resources, and human-in-the-loop grounding safeguards.",
        badge: "Legal",
        icon: AlertTriangle,
      },
    ],
  },
];

export default function UserSitemapPage() {
  return (
    <EditorialShell
      badge="Directory Index"
      title="User Sitemap &amp; Directory"
      subtitle="A complete architectural index of all 18 application routes across our public narrative, personal archive workspace, memory intelligence engine, and governance charter."
      lastUpdated="November 2026"
      wide
    >
      <div className={styles.aboutContainer}>
        {/* Top Telemetry Strip */}
        <div className={styles.metricsStrip} aria-label="Sitemap metrics summary">
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>01 · Total Surface</span>
            <span className={styles.metricValue}>18 Routes</span>
            <span className={styles.metricSub}>Complete application index</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>02 · Vault Workspace</span>
            <span className={styles.metricValue}>10 Views</span>
            <span className={styles.metricSub}>Core archive &amp; AI intelligence</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>03 · Public &amp; Legal</span>
            <span className={styles.metricValue}>8 Pages</span>
            <span className={styles.metricSub}>Story, FAQ, Auth &amp; Governance</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>04 · Demo Sandbox</span>
            <span className={styles.metricValue}>100% Open</span>
            <span className={styles.metricSub}>Direct ?demo=jimmy shortcuts</span>
          </div>
        </div>

        {/* 4 Numbered 2-Column Editorial Sections */}
        {DIRECTORY.map((section) => (
          <section
            key={section.indexLabel}
            className={styles.chapterSection}
            aria-labelledby={`sitemap-${section.indexLabel}`}
          >
            <div className={styles.indexColumn}>
              <span className={styles.chapterNumber}>
                <span className={styles.chapterDot} aria-hidden="true" />
                {section.indexLabel}
              </span>
              <h2 id={`sitemap-${section.indexLabel}`} className={styles.chapterTitle}>
                {section.title}
              </h2>
              <p className={styles.chapterLead}>{section.lead}</p>
              <span className={styles.chapterMetaBadge}>{section.metaBadge}</span>
            </div>

            <div className={styles.contentColumn}>
              <div className={styles.routeGrid}>
                {section.pages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <div key={page.path} className={styles.routeCard}>
                      <div>
                        <div className={styles.routeCardTop}>
                          <div className={styles.routeIconWrap}>
                            <span className={styles.routeIconBox}>
                              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                            <code className={styles.routePathCode}>{page.path}</code>
                          </div>
                          <span className={styles.routeBadge}>{page.badge}</span>
                        </div>
                        <h3 className={styles.routeTitle}>{page.title}</h3>
                        <p className={styles.routeDesc}>{page.description}</p>
                      </div>

                      <div className={styles.routeActions}>
                        <Link href={page.path} className={styles.routeLinkPrimary}>
                          <span>Open Route</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                        {page.demoPath && (
                          <Link href={page.demoPath} className={styles.routeLinkDemo}>
                            <span>✦ Demo Preview</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </EditorialShell>
  );
}
