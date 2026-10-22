"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { QuickLogger } from "@/components/activity/QuickLogger";
import { DashboardTraceRow } from "@/components/dashboard/DashboardTraceRow";
import { EvidenceDrawer } from "@/components/insights/EvidenceDrawer";
import { VaultShell } from "@/components/layout/VaultShell";
import { generateDeterministicInsights, insightToRecord } from "@/lib/analytics/insights";
import { timelineToAnalytics } from "@/lib/analytics/adapters";
import { detectFirstTimes } from "@/lib/analytics/first-time";
import { selectForgottenCandidate } from "@/lib/queries/forgotten";
import { formatArchiveDate } from "@/lib/utils/dates";
import type { ArchiveData, TimelineItem } from "@/lib/queries/activities";
import type { Insight } from "@/types/database";
import { dashboardSans, dashboardSerif } from "./fonts";
import "./dashboard.css";

const dashboardFonts = dashboardSans.variable + " " + dashboardSerif.variable;

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export default function DashboardClient({
  initialData,
  isDemo,
  userName,
}: {
  initialData: ArchiveData;
  isDemo: boolean;
  userName?: string | null;
}) {
  const router = useRouter();
  const [extraDemoItems, setExtraDemoItems] = useState<TimelineItem[]>([]);
  const [optimisticItems, setOptimisticItems] = useState<TimelineItem[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isDemo) {
      try {
        const stored = sessionStorage.getItem("extra_demo_memories");
        if (stored) {
          const raw = JSON.parse(stored) as TimelineItem[];
          const deduplicated = raw.filter(
            (item, idx, arr) => idx === 0 || item.summary.trim().toLowerCase() !== arr[idx - 1].summary.trim().toLowerCase()
          );
          if (deduplicated.length !== raw.length) {
            sessionStorage.setItem("extra_demo_memories", JSON.stringify(deduplicated));
          }
          setExtraDemoItems(deduplicated);
        }
      } catch {
        // ignore
      }
    }
  }, [isDemo]);

  const items = useMemo(() => {
    const base = isDemo && extraDemoItems.length
      ? [...extraDemoItems, ...initialData.items]
      : initialData.items;
    const combined = optimisticItems.length ? [...optimisticItems, ...base] : base;
    // Chronological hierarchy: newest traces first (descending)
    return [...combined].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }, [optimisticItems, extraDemoItems, initialData.items, isDemo]);

  const detectedFirstTimesCount = useMemo(() => {
    const analytics = timelineToAnalytics(items);
    return detectFirstTimes(analytics).length;
  }, [items]);

  const stats = useMemo(() => ({
    ...initialData.stats,
    activities: items.filter((item) => item.eventStatus === "completed").length,
    firstTimes: detectedFirstTimesCount || items.filter((item) => item.isFirstTime).length,
  }), [initialData.stats, items, detectedFirstTimesCount]);

  const displayName = isDemo ? "Jimmy" : userName || "Archivist";
  const linkSuffix = isDemo ? "?demo=jimmy" : "";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const settleOptimisticItem = ({ optimisticId, activityId }: { optimisticId: string; activityId?: string }) => {
    setOptimisticItems((current) => current.filter((item) => item.id !== optimisticId));
    if (isDemo && activityId) {
      try {
        const stored = sessionStorage.getItem("extra_demo_memories");
        if (stored) {
          const raw = JSON.parse(stored) as TimelineItem[];
          const deduplicated = raw.filter(
            (item, idx, arr) => idx === 0 || item.summary.trim().toLowerCase() !== arr[idx - 1].summary.trim().toLowerCase()
          );
          setExtraDemoItems(deduplicated);
        }
      } catch {
        // ignore
      }
    }
    router.refresh();
  };

  // 100% deterministic candidates for Hero Moments
  const forgottenCandidate = useMemo(() => selectForgottenCandidate(items), [items]);

  const topInsights = useMemo(() => {
    const analytics = timelineToAnalytics(items);
    return generateDeterministicInsights(analytics).slice(0, 3);
  }, [items]);

  return (
    <VaultShell title="Your memories" isDemo={isDemo} userName={userName} items={items}>
      <main className="dashboard-page">
        <header className="dashboard-intro">
          <div>
            <h1 suppressHydrationWarning>{getGreeting(displayName)}</h1>
          </div>
          <p className="dashboard-today" suppressHydrationWarning>{today}</p>
        </header>

        <QuickLogger demo={isDemo}
          onOptimisticItem={(item) => setOptimisticItems((current) => [item, ...current])}
          onSettled={settleOptimisticItem} />

        {initialData.error && !isDemo && (
          <div role="alert" className="dashboard-error">{initialData.error}</div>
        )}

        {items.length > 0 && (
          <nav aria-label="Your archive at a glance" className="dashboard-index">
            {[
              { label: "Moments", value: stats.activities, path: "/timeline" },
              { label: "People", value: stats.people, path: "/people" },
              { label: "Places", value: stats.places, path: "/places" },
              { label: "Topics", value: stats.topics, path: "/topics" },
              { label: "First Times", value: stats.firstTimes, path: "/timeline" },
            ].map(({ label, value, path }) => (
              <Link key={label} href={path + linkSuffix}>
                <span>{label}</span><strong>{value}</strong>
              </Link>
            ))}
          </nav>
        )}

        {items.length === 0 ? (
          <section className="dashboard-empty" aria-labelledby="empty-archive-heading">
            <h2 id="empty-archive-heading">A place for your first memory.</h2>
            <p>A conversation, a small discovery, an ordinary day. Write a few words above to keep it here.</p>
          </section>
        ) : (
          <div className="dashboard-content">
            <section aria-labelledby="recent-memories-heading" className="dashboard-feed">
              <div className="dashboard-section-heading">
                <h2 id="recent-memories-heading">Recent memories</h2>
                <Link href={"/timeline" + linkSuffix} className="dashboard-text-link">
                  View all <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </div>
              <div className="dashboard-traces">
                {items.slice(0, 5).map((item, index, list) => (
                  <DashboardTraceRow key={item.id} item={item} demo={isDemo} index={index}
                    isSameDayAsPrev={index > 0 && list[index - 1].occurredAt === item.occurredAt}
                    isSameDayAsNext={index < list.length - 1 && list[index + 1].occurredAt === item.occurredAt} />
                ))}
              </div>
            </section>
            <aside aria-label="From your archive" className="dashboard-companion">
              <SurfaceAgainCard candidate={forgottenCandidate} linkSuffix={linkSuffix} />
              <EmergingPatternsCard topInsights={topInsights} linkSuffix={linkSuffix}
                onSelectInsight={(insight) => { setSelectedInsight(insight); setDrawerOpen(true); }} />
            </aside>
          </div>
        )}
      </main>
      <EvidenceDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}
        insight={selectedInsight} demo={isDemo} className={"dashboard-evidence " + dashboardFonts} />
    </VaultShell>
  );
}

function SurfaceAgainCard({ candidate, linkSuffix }: {
  candidate: (TimelineItem & { daysAgo?: number }) | null;
  linkSuffix: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (!candidate) return null;

  return (
    <section className="dashboard-rediscovered" aria-labelledby="rediscovered-heading">
      <div className="dashboard-section-heading">
        <h2 id="rediscovered-heading">Rediscovered memory</h2>
        {!dismissed && (
          <button type="button" onClick={() => setDismissed(true)} className="dashboard-icon-button"
            aria-label="Dismiss rediscovered memory"><X aria-hidden="true" size={16} /></button>
        )}
      </div>
      {dismissed ? (
        <div className="dashboard-dismissed">
          <p>Set aside for now.</p>
          <button type="button" onClick={() => setDismissed(false)} className="dashboard-text-link">Undo</button>
        </div>
      ) : (
        <>
          <p className="dashboard-memory-date">
            <time dateTime={candidate.occurredAt}>{formatArchiveDate(candidate.occurredAt)}</time>
            <span>Quiet for {candidate.daysAgo ?? 0} days</span>
          </p>
          <blockquote>{candidate.summary}</blockquote>
          {(candidate.people.length > 0 || candidate.places.length > 0) && (
            <p className="dashboard-memory-context">
              {[
                candidate.people.length > 0 ? "With " + candidate.people.map((person) => person.name).join(", ") : "",
                candidate.places.length > 0 ? "at " + candidate.places.map((place) => place.name).join(", ") : "",
              ].filter(Boolean).join(" · ")}
            </p>
          )}
          <Link href={"/forgot-this" + linkSuffix} className="dashboard-text-link">
            Revisit memory <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </>
      )}
    </section>
  );
}

function EmergingPatternsCard({ topInsights, linkSuffix, onSelectInsight }: {
  topInsights: Array<Pick<Insight, "type" | "title" | "description" | "category" | "evidence" | "metadata">>;
  linkSuffix: string;
  onSelectInsight: (insight: Insight) => void;
}) {
  if (topInsights.length === 0) return null;
  return (
    <section className="dashboard-patterns" aria-labelledby="patterns-heading">
      <div className="dashboard-section-heading">
        <h2 id="patterns-heading">Noticed in your memories</h2>
      </div>
      <ul className="dashboard-pattern-list">
        {topInsights.map((insight, index) => (
          <li key={insight.type + "-" + index}>
            <h3>{insight.title}</h3>
            <p>{insight.description}</p>
            <button type="button" className="dashboard-text-link"
              onClick={() => onSelectInsight(insightToRecord(insight, index) as Insight)}
              aria-label={"View evidence for " + insight.title}>
              {insight.evidence.length} {insight.evidence.length === 1 ? "memory" : "memories"}
              <ArrowUpRight aria-hidden="true" size={14} />
            </button>
          </li>
        ))}
      </ul>
      <Link href={"/insights" + linkSuffix} className="dashboard-text-link">
        All insights <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </section>
  );
}
