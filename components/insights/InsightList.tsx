"use client";

import { useState, useMemo } from "react";
import { Compass, ArrowRight, Layers, Flame, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import type { Insight } from "@/types/database";
import { EvidenceDrawer } from "./EvidenceDrawer";

type TabFilter = "all" | "first_time" | "recurring" | "change";

interface InsightListProps {
  insights: Insight[];
  demo?: boolean;
}

export function InsightList({ insights, demo = false }: InsightListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const counts = useMemo(() => {
    return {
      all: insights.length,
      first_time: insights.filter((i) => i.type === "first_time").length,
      recurring: insights.filter((i) => i.type === "recurring").length,
      change: insights.filter((i) => i.type === "change").length,
    };
  }, [insights]);

  const filteredInsights = useMemo(() => {
    if (activeTab === "all") return insights;
    return insights.filter((i) => i.type === activeTab);
  }, [insights, activeTab]);

  const handleOpenDrawer = (insight: Insight) => {
    setSelectedInsight(insight);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedInsight(null);
  };

  return (
    <div>
      {/* 4-Category Filter Tabs */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-hairline/60 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs transition-all ${
            activeTab === "all"
              ? "border border-brand/30 bg-brand/10 font-semibold text-brand"
              : "border border-hairline bg-surface text-muted hover:border-brand/20 hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          All Patterns <span className="text-[10px] opacity-75">({counts.all})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("first_time")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs transition-all ${
            activeTab === "first_time"
              ? "border border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-400"
              : "border border-hairline bg-surface text-muted hover:border-emerald-500/20 hover:text-foreground"
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          First-Times <span className="text-[10px] opacity-75">({counts.first_time})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recurring")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs transition-all ${
            activeTab === "recurring"
              ? "border border-amber-500/30 bg-amber-500/10 font-semibold text-amber-700 dark:text-amber-400"
              : "border border-hairline bg-surface text-muted hover:border-amber-500/20 hover:text-foreground"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          Recurring <span className="text-[10px] opacity-75">({counts.recurring})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("change")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs transition-all ${
            activeTab === "change"
              ? "border border-indigo-500/30 bg-indigo-500/10 font-semibold text-indigo-700 dark:text-indigo-400"
              : "border border-hairline bg-surface text-muted hover:border-indigo-500/20 hover:text-foreground"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Monthly Shifts <span className="text-[10px] opacity-75">({counts.change})</span>
        </button>
      </div>

      {/* Cards Feed */}
      {filteredInsights.length === 0 ? (
        <div className="rounded-3xl border border-hairline bg-surface p-12 text-center">
          <p className="font-serif text-xl text-muted">No patterns detected for this filter.</p>
          <p className="mt-2 text-xs text-muted">Keep logging daily activities to unlock deeper insights.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredInsights.map((insight, index) => {
            const evidenceCount = insight.evidence?.length || 0;
            const metadata = (insight.metadata as Record<string, unknown>) || {};
            const monthBadge = metadata.month ? String(metadata.month) : null;

            return (
              <article
                key={insight.id || `${insight.type}-${index}`}
                className="flex flex-col justify-between rounded-3xl border border-hairline bg-surface p-6 shadow-xs transition-all duration-200 hover:border-border-strong hover:shadow-sm"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        insight.type === "first_time"
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : insight.type === "recurring"
                          ? "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "border border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                      }`}
                    >
                      {insight.type.replace("_", " ")}
                    </span>

                    {monthBadge && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
                        <Calendar className="h-3 w-3" />
                        {monthBadge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-3.5 font-serif text-xl font-normal leading-snug text-foreground">
                    {insight.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {insight.description}
                  </p>

                  {/* Snippet Preview */}
                  {insight.evidence && insight.evidence.length > 0 && (
                    <div className="mt-4 rounded-xl border border-hairline/60 bg-surface-subdued/50 p-3 text-xs italic text-muted">
                      “{insight.evidence[0].snippet}”
                    </div>
                  )}
                </div>

                {/* Bottom Evidence Trigger Button */}
                <div className="mt-6 flex items-center justify-between border-t border-hairline/60 pt-4">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
                    <CheckCircle2 className="h-3 w-3 text-brand" />
                    {evidenceCount} verified {evidenceCount === 1 ? "source" : "sources"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenDrawer(insight)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 font-mono text-xs font-medium text-brand transition hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
                  >
                    <span>{evidenceCount} Sources</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Hero 2: Interactive Evidence Drawer */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        insight={selectedInsight}
        demo={demo}
      />
    </div>
  );
}
