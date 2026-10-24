import type { Metadata } from "next";
import Link from "next/link";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import {
  Compass,
  Calendar,
  Users,
  MapPin,
  Tag,
  MessageSquare,
  TrendingUp,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Settings,
  Lock,
  UserPlus,
  ArrowRight,
  Database,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Visual User Sitemap & Directory · Life Memory",
  description:
    "Complete directory of all pages, intelligence features, entity directories, and legal documentation in Life Memory.",
};

interface DirectorySection {
  title: string;
  description: string;
  pages: {
    title: string;
    path: string;
    description: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const DIRECTORY: DirectorySection[] = [
  {
    title: "1. Public Narrative & Story",
    description: "Introductory experiences and philosophy behind our living archive.",
    pages: [
      {
        title: "Landing Overview",
        path: "/",
        description: "The 3D paper scroll origin story, interactive reconstruction demo, and closing colophon.",
        badge: "Public",
        icon: Compass,
      },
      {
        title: "About Our Philosophy",
        path: "/about",
        description: "The science of memory decay, digital amnesia, and our ethical AI charter.",
        badge: "Public",
        icon: BookOpen,
      },
      {
        title: "Frequently Asked Questions",
        path: "/faq",
        description: "Interactive accordion answers covering AI safety, privacy, and journaling tips.",
        badge: "Public",
        icon: HelpCircle,
      },
    ],
  },
  {
    title: "2. Personal Archive Core",
    description: "The central vault where daily memories are logged, reviewed, and organized.",
    pages: [
      {
        title: "Archive Dashboard",
        path: "/dashboard",
        description: "Central command center with Quick Logger, S-14 reveal card, and stats summary.",
        badge: "Demo & Auth",
        icon: Compass,
      },
      {
        title: "Chronological Timeline",
        path: "/timeline",
        description: "Complete chronological feed of all logged memories with category filtering and search.",
        badge: "Demo & Auth",
        icon: Calendar,
      },
      {
        title: "People Directory",
        path: "/people",
        description: "Catalogue of all friends and contacts mentioned, with visit counts and last seen dates.",
        badge: "Demo & Auth",
        icon: Users,
      },
      {
        title: "Places Directory",
        path: "/places",
        description: "Map of visited venues, cafes, and labs with first and most recent visit boundaries.",
        badge: "Demo & Auth",
        icon: MapPin,
      },
      {
        title: "Topics Directory",
        path: "/topics",
        description: "Living index of skills, projects, technologies, and curiosities pursued over time.",
        badge: "Demo & Auth",
        icon: Tag,
      },
    ],
  },
  {
    title: "3. AI Intelligence & Retrospection",
    description: "Gemini-powered pattern derivation, introspective reflections, and conversational recall.",
    pages: [
      {
        title: "Tanya AI (Memory Chat Assistant)",
        path: "/chat",
        description: "ChatGPT-style multi-session chat assistant that queries your memories and saves notes directly.",
        badge: "Demo & Auth",
        icon: MessageSquare,
      },
      {
        title: "Pattern Insights & Evidence Drawer",
        path: "/insights",
        description: "Automated derivation of first-time milestones, habits, and monthly category shifts.",
        badge: "Demo & Auth",
        icon: TrendingUp,
      },
      {
        title: "Monthly Reflection Magazine",
        path: "/reflection",
        description: "Literary essay synthesized by Gemini 3.8 Flash with continuous interactive footnotes.",
        badge: "Demo & Auth",
        icon: BookOpen,
      },
      {
        title: "You Probably Forgot This (S-14)",
        path: "/forgot-this",
        description: "Deterministic algorithm surfacing authentic memories dormant for over 21 days.",
        badge: "Demo & Auth",
        icon: Calendar,
      },
    ],
  },
  {
    title: "4. Trust, Governance & Settings",
    description: "Privacy commitments, data portability tools, and legal agreements.",
    pages: [
      {
        title: "Settings & Data Portability",
        path: "/settings",
        description: "Theme selector (Light/Dark/System), full JSON archive export, and Danger Zone purge.",
        badge: "Settings",
        icon: Settings,
      },
      {
        title: "Privacy Policy",
        path: "/privacy",
        description: "GDPR/CCPA disclosures, zero model training commitments, and Supabase RLS security.",
        badge: "Legal",
        icon: ShieldCheck,
      },
      {
        title: "Terms of Service",
        path: "/terms",
        description: "100% user copyright retention, permissible use, and service commitments.",
        badge: "Legal",
        icon: Scale,
      },
      {
        title: "AI Safety & Disclaimer",
        path: "/disclaimer",
        description: "Important non-medical advice notice and mental health crisis hotline references.",
        badge: "Legal",
        icon: AlertTriangle,
      },
      {
        title: "Account Sign In",
        path: "/login",
        description: "Sign in with email and password or Google OAuth.",
        badge: "Auth",
        icon: Lock,
      },
      {
        title: "New Account Registration",
        path: "/register",
        description: "Create your private cloud vault on Supabase.",
        badge: "Auth",
        icon: UserPlus,
      },
    ],
  },
];

export default function UserSitemapPage() {
  return (
    <EditorialShell
      badge="Directory Index"
      title="User Sitemap &amp; Directory"
      subtitle="A complete, accessible visual index of every public narrative page, personal archive view, AI intelligence feature, and legal disclosure in Life Memory."
      lastUpdated="October 2026"
    >
      <div className="space-y-12">
        {DIRECTORY.map((section) => (
          <section key={section.title} className="space-y-4">
            <div className="border-b border-hairline/80 pb-2">
              <h2 className="font-serif text-2xl font-medium text-foreground">
                {section.title}
              </h2>
              <p className="text-xs text-muted mt-1">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.pages.map((page) => {
                const Icon = page.icon;
                return (
                  <Link
                    key={page.path}
                    href={page.path}
                    className="group flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 transition-all hover:border-brand/40 hover:bg-surface-elevated/40 hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-subdued text-brand group-hover:bg-brand/10 transition-colors">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="rounded-full bg-surface-subdued px-2.5 py-0.5 font-mono text-[10px] text-muted">
                          {page.badge}
                        </span>
                      </div>
                      <h3 className="mt-3 font-serif text-lg font-medium text-foreground group-hover:text-brand transition-colors">
                        {page.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted leading-relaxed">
                        {page.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-1 font-mono text-[11px] text-faint group-hover:text-brand transition-colors">
                      <span>{page.path}</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </EditorialShell>
  );
}
