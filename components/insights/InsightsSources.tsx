"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import { formatInsightDate, insightTimelineHref, type InsightView } from "@/lib/insights/model";
import styles from "./Insights.module.css";

export function InsightsSources({ insight, demo, onClose }: { insight: InsightView; demo: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollArea = document.querySelector<HTMLElement>(".overflow-y-auto.overscroll-y-contain");
    const overflow = scrollArea?.style.overflowY ?? "";
    if (scrollArea) scrollArea.style.overflowY = "hidden";
    element?.showModal();
    const blockGlobalShortcuts = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ["k", "b"].includes(event.key.toLowerCase())) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    document.addEventListener("keydown", blockGlobalShortcuts, true);
    return () => {
      document.removeEventListener("keydown", blockGlobalShortcuts, true);
      element?.close();
      if (scrollArea) scrollArea.style.overflowY = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <dialog ref={dialog} data-insights-dialog lang="id" aria-labelledby="insights-source-title" aria-describedby="insights-source-description"
      className={["lm-vault-shell--dashboard", dashboardSans.variable, dashboardSerif.variable, styles.dialog].join(" ")}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}>
      <div className={styles.dialogLayout}>
        <header className={styles.dialogHeader}>
          <p>Catatan sumber</p><button type="button" autoFocus aria-label="Tutup catatan sumber" onClick={onClose}><X size={22} aria-hidden="true" /></button>
        </header>
        <div className={styles.dialogScroll}>
          <p className={styles.period}>{insight.period}</p>
          <h2 id="insights-source-title">{insight.label}</h2>
          <p id="insights-source-description" className={styles.dialogDescription}>{insight.description}</p>
          <p className={styles.sourceCount}>{insight.evidence.length < insight.sourceCount ? `${insight.evidence.length} cuplikan dari ${insight.sourceCount} memori terkait` : `${insight.evidence.length} memori terkait`} · Terbaru dahulu</p>
          {insight.evidence.length ? <ol className={styles.sourceList}>{insight.evidence.map(source => <li key={source.activityDetailId}>
            <time dateTime={source.occurredAt}>{formatInsightDate(source.occurredAt)}</time>
            <blockquote>{source.snippet || "Cuplikan catatan belum tersedia."}</blockquote>
            <Link href={insightTimelineHref(source.activityDetailId, demo)} data-insight-timeline onClick={onClose}>Buka di timeline <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </li>)}</ol> : <p className={styles.noSources}>Catatan sumber belum tersedia.</p>}
        </div>
      </div>
    </dialog>, document.body,
  );
}
