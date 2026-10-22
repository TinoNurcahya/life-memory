"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Tag, User, AlertTriangle, X } from "lucide-react";
import { removeActivityEntity, updateActivityCategory } from "@/app/actions/activities";
import type { TimelineItem } from "@/lib/queries/activities";
import type { ActivityCategory } from "@/types/database";
import { formatArchiveDate } from "@/lib/utils/dates";
import Link from "next/link";
import { EntityControls } from "@/components/activity/EntityControls";
import { MemoryImageGrid } from "@/components/activity/MemoryImageGrid";

const categories: ActivityCategory[] = ["career", "social", "health", "learning", "leisure", "routine", "other"];

export function TimelineCard({ item, demo = false, editorial = false, index = 0 }: { item: TimelineItem; demo?: boolean; editorial?: boolean; index?: number }) {
  const router = useRouter();
  const [category, setCategory] = useState(item.category ?? "other");
  const [isPending, startTransition] = useTransition();
  const remove = (kind: "people" | "places" | "topics", id: string) => {
    if (demo) return;
    startTransition(async () => { await removeActivityEntity(item.id, kind, id); router.refresh(); });
  };
  const changeCategory = (value: ActivityCategory) => {
    if (demo) return;
    setCategory(value);
    startTransition(async () => { await updateActivityCategory(item.id, value); router.refresh(); });
  };
  const retry = () => {
    if (demo) return;
    startTransition(async () => {
      await fetch("/api/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityId: item.activityId }) });
      router.refresh();
    });
  };
  const linkSuffix = demo ? "?demo=jimmy" : "";
  return <article className={editorial ? "lm-dashboard-timeline-card" : "timeline-row"} data-index={index}>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
      <time dateTime={item.occurredAt} className="font-semibold text-foreground">{formatArchiveDate(item.occurredAt)}</time>
      {item.status === "PENDING" ? <span className="animate-pulse rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-brand">Extracting…</span> : item.status === "FAILED" ? (demo ? <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-red-700 dark:text-red-300">Extraction failed</span> : <button type="button" onClick={retry} disabled={isPending} className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-red-700 hover:underline disabled:opacity-50 dark:text-red-300">Retry extraction</button>) : null}
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select aria-label="Activity category" value={category} disabled={demo || isPending || item.status === "PENDING"} onChange={(event) => changeCategory(event.target.value as ActivityCategory)} className="rounded-lg border border-hairline bg-surface-subdued px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider text-muted outline-none focus:border-brand">
        {categories.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      {item.eventStatus && item.eventStatus !== "completed" && <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs uppercase text-amber-700 dark:text-amber-300">{item.eventStatus}</span>}
      {item.isFirstTime && <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">First time</span>}
      {item.needsReview && <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-300"><AlertTriangle className="h-3 w-3" />Needs review</span>}
    </div>
    <div className="timeline-row__content">
      <p className="font-serif text-lg leading-relaxed text-foreground/90">{item.summary}</p>
      {item.imageUrls && item.imageUrls.length > 0 && (
        <MemoryImageGrid compact images={item.imageUrls} summary={item.summary} date={formatArchiveDate(item.occurredAt)} />
      )}
    </div>
    {(item.people.length || item.places.length || item.topics.length) > 0 && <div className="mt-3 flex flex-wrap gap-2 border-t border-hairline/50 pt-2.5">
      {item.people.map((entity) => <span key={entity.id} className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-subdued px-2.5 py-1 text-xs text-foreground"><User className="h-3 w-3 text-brand" /><Link href={`/people/${entity.id}${linkSuffix}`} className="hover:text-brand hover:underline">{entity.name}</Link>{!demo && <button type="button" aria-label={`Remove ${entity.name}`} onClick={() => remove("people", entity.id)}><X className="h-3 w-3 text-muted" /></button>}</span>)}
      {item.places.map((entity) => <span key={entity.id} className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface-subdued px-2.5 py-1 text-xs text-foreground"><MapPin className="h-3 w-3 text-brand" /><Link href={`/places/${entity.id}${linkSuffix}`} className="hover:text-brand hover:underline">{entity.name}</Link>{!demo && <button type="button" aria-label={`Remove ${entity.name}`} onClick={() => remove("places", entity.id)}><X className="h-3 w-3 text-muted" /></button>}</span>)}
      {item.topics.map((entity) => <span key={entity.id} className="inline-flex items-center gap-1 rounded-md border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs text-brand"><Tag className="h-3 w-3" /><Link href={`/topics/${entity.id}${linkSuffix}`} className="hover:underline">{entity.name}</Link>{!demo && <button type="button" aria-label={`Remove ${entity.name}`} onClick={() => remove("topics", entity.id)}><X className="h-3 w-3 text-muted" /></button>}</span>)}
    </div>}
    {!demo && item.status === "RESOLVED" && <EntityControls detailId={item.id} />}
  </article>;
}
