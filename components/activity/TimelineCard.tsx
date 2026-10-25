"use client";

import { useId, useOptimistic, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { removeActivityEntity, updateActivityCategory } from "@/app/actions/activities";
import type { TimelineItem } from "@/lib/queries/activities";
import type { ActivityCategory } from "@/types/database";
import { formatArchiveDate } from "@/lib/utils/dates";
import { EntityControls } from "@/components/activity/EntityControls";
import { MemoryImageGrid } from "@/components/activity/MemoryImageGrid";
import styles from "./TimelineCard.module.css";

const categories: ActivityCategory[] = ["career", "social", "health", "learning", "leisure", "routine", "other"];
const entityKinds = ["people", "places", "topics"] as const;
type Feedback = { error: boolean; text: string } | null;

export function TimelineCard({ item, demo = false, index = 0 }: { item: TimelineItem; demo?: boolean; editorial?: boolean; index?: number }) {
  const router = useRouter();
  const panelId = useId();
  const editButton = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [entityPending, setEntityPending] = useState(false);
  const [category, setCategory] = useOptimistic(item.category ?? "other");
  const [isPending, startTransition] = useTransition();
  const busy = isPending || entityPending;
  const linkSuffix = demo ? "?demo=jimmy" : "";

  const remove = (kind: typeof entityKinds[number], id: string, name: string) => {
    if (demo || busy) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await removeActivityEntity(item.id, kind, id);
        if (!result.success) {
          setFeedback({ error: true, text: result.error });
          return;
        }
        setFeedback({ error: false, text: `Removed ${name}.` });
        router.refresh();
      } catch {
        setFeedback({ error: true, text: "Could not remove this detail. Try again." });
      }
    });
  };

  const changeCategory = (value: ActivityCategory) => {
    if (demo || busy) return;
    setFeedback(null);
    startTransition(async () => {
      setCategory(value);
      try {
        const result = await updateActivityCategory(item.id, value);
        if (!result.success) {
          setFeedback({ error: true, text: result.error });
          return;
        }
        setFeedback({ error: false, text: "Category updated." });
        router.refresh();
      } catch {
        setFeedback({ error: true, text: "Could not update the category. Try again." });
      }
    });
  };

  const retry = () => {
    if (demo || busy) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityId: item.activityId }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success !== true) {
          setFeedback({ error: true, text: result?.error || "Extraction failed. Try again." });
          return;
        }
        setFeedback({ error: false, text: "Memory details updated." });
        router.refresh();
      } catch {
        setFeedback({ error: true, text: "Could not retry extraction. Check your connection and try again." });
      }
    });
  };

  const closeEditor = () => {
    setEditing(false);
    editButton.current?.focus();
  };
  const handleEditorKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (editing && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeEditor();
    }
  };

  return (
    <article
      id={item.id}
      className={`timeline-entry ${styles.entry}`}
      data-index={index}
      data-memory-id={item.id}
    >
      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={`timeline-entry__story ${styles.story}`}>{item.summary}</p>
          <div className={styles.context}>
            <span className={styles.category}>{category}</span>
            {entityKinds.map((kind) => item[kind].map((entity) => (
              <Link key={`${kind}-${entity.id}`} href={`/${kind}/${entity.id}${linkSuffix}`}>
                {entity.name}
              </Link>
            )))}
          </div>
          {(item.status !== "RESOLVED" || item.eventStatus && item.eventStatus !== "completed" || item.isFirstTime || item.needsReview) && (
            <div className={styles.statuses}>
              {item.status === "PENDING" && <span role="status">Extracting…</span>}
              {item.status === "FAILED" && <span className={styles.warning}>Extraction failed</span>}
              {item.eventStatus && item.eventStatus !== "completed" && <span className={styles.eventStatus}>{item.eventStatus}</span>}
              {item.isFirstTime && <span>First time</span>}
              {item.needsReview && <span className={styles.warning}>Needs review</span>}
            </div>
          )}
        </div>
        <MemoryImageGrid compact images={item.imageUrls} summary={item.summary} date={formatArchiveDate(item.occurredAt)} />
      </div>

      {!demo && item.status === "FAILED" && (
        <button type="button" className={styles.textButton} onClick={retry} disabled={busy}>
          {isPending ? "Retrying extraction…" : "Retry extraction"}
        </button>
      )}
      {!demo && item.status === "RESOLVED" && (
        <>
          <button
            ref={editButton}
            type="button"
            className={styles.textButton}
            aria-expanded={editing}
            aria-controls={panelId}
            onClick={() => setEditing((value) => !value)}
            onKeyDown={handleEditorKeyDown}
          >
            {editing ? "Close details" : "Edit details"}
          </button>
          {editing && (
            <div
              id={panelId}
              className={styles.editor}
              role="group"
              aria-label="Edit memory details"
              aria-busy={busy}
              onKeyDown={handleEditorKeyDown}
            >
              <label className={styles.field}>
                Category
                <select value={category} disabled={busy} onChange={(event) => changeCategory(event.target.value as ActivityCategory)}>
                  {categories.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
                </select>
              </label>
              {entityKinds.map((kind) => item[kind].length > 0 && (
                <div key={kind} className={styles.entityGroup}>
                  <p className={styles.entityLabel}>{kind[0].toUpperCase() + kind.slice(1)}</p>
                  <ul className={styles.entityList}>
                    {item[kind].map((entity) => (
                      <li key={entity.id}>
                        <span>{entity.name}</span>
                        <button type="button" disabled={busy} aria-label={`Remove ${entity.name}`} onClick={() => remove(kind, entity.id, entity.name)}>
                          <X size={16} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <EntityControls detailId={item.id} disabled={busy} onPendingChange={setEntityPending} />
            </div>
          )}
        </>
      )}
      {isPending && <p className={styles.feedback} role="status">{item.status === "FAILED" ? "Extracting memory details…" : "Saving details…"}</p>}
      {feedback && !isPending && <p className={`${styles.feedback} ${feedback.error ? styles.error : ""}`} role={feedback.error ? "alert" : "status"}>{feedback.text}</p>}
    </article>
  );
}
