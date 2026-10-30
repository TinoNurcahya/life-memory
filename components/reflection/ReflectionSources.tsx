"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import { formatReflectionDate, type FormattedFootnote } from "@/lib/reflection/monthly";
import styles from "./Reflection.module.css";

export function ReflectionSources({ footnote, demo, onClose }: { footnote: FormattedFootnote; demo: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scroller = document.querySelector<HTMLElement>(".overflow-y-auto.overscroll-y-contain");
    const previousOverflow = scroller?.style.overflowY ?? "";
    if (scroller) scroller.style.overflowY = "hidden";
    element?.showModal();
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ["k", "b"].includes(event.key.toLowerCase())) { event.preventDefault(); event.stopImmediatePropagation(); }
      if (event.key === "Tab") {
        const controls = Array.from(element?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]") ?? []).filter(control => control.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      element?.close();
      if (scroller) scroller.style.overflowY = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      else document.querySelector<HTMLElement>("[data-reflection-generate]")?.focus({ preventScroll: true });
    };
  }, []);

  const people = [...new Set(footnote.evidence.people)];
  const places = [...new Set(footnote.evidence.places)];
  return createPortal(<dialog ref={dialog} data-reflection-dialog lang="id" aria-labelledby="reflection-dialog-title"
    className={["lm-vault-shell--dashboard", dashboardSans.variable, dashboardSerif.variable, styles.dialog].join(" ")}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className={styles.dialogLayout}>
      <header className={styles.dialogHeader}><h2 id="reflection-dialog-title">Catatan sumber [{footnote.globalIndex}]</h2><button type="button" autoFocus aria-label="Tutup catatan sumber" onClick={onClose}><X size={22} aria-hidden="true" /></button></header>
      <div className={styles.dialogScroll}>
        <time dateTime={footnote.evidence.date}>{formatReflectionDate(footnote.evidence.date)}</time>
        <blockquote>{footnote.evidence.summary}</blockquote>
        {(people.length > 0 || places.length > 0) && <dl className={styles.sourceContext}>
          {people.length > 0 && <div><dt>Orang</dt><dd>{people.join(", ")}</dd></div>}
          {places.length > 0 && <div><dt>Tempat</dt><dd>{places.join(", ")}</dd></div>}
        </dl>}
        <Link data-reflection-timeline href={`/timeline${demo ? "?demo=jimmy" : ""}#${encodeURIComponent(footnote.evidenceId)}`} onClick={onClose}>Buka di timeline<ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </div>
  </dialog>, document.body);
}
