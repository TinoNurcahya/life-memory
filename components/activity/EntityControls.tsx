"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addActivityEntity } from "@/app/actions/activities";
import styles from "./EntityControls.module.css";

interface EntityControlsProps {
  detailId: string;
  disabled?: boolean;
  onPendingChange?: (pending: boolean) => void;
}

export function EntityControls({ detailId, disabled = false, onPendingChange }: EntityControlsProps) {
  const router = useRouter();
  const id = useId();
  const [kind, setKind] = useState<"people" | "places" | "topics">("people");
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const submit = () => {
    const value = name.trim();
    if (!value || disabled || pending) return;
    setFeedback(null);
    onPendingChange?.(true);
    startTransition(async () => {
      try {
        const result = await addActivityEntity(detailId, kind, value);
        if (!result.success) {
          setFeedback({ error: true, text: result.error });
          return;
        }
        setName("");
        setFeedback({ error: false, text: `Added ${value}.` });
        router.refresh();
      } catch {
        setFeedback({ error: true, text: "Could not add this detail. Check your connection and try again." });
      } finally {
        onPendingChange?.(false);
      }
    });
  };

  return (
    <form className={styles.form} onSubmit={(event) => { event.preventDefault(); submit(); }}>
      <div className={styles.fields}>
        <label htmlFor={`${id}-kind`} className={styles.kind}>
          Add detail
          <select id={`${id}-kind`} value={kind} disabled={disabled || pending} onChange={(event) => setKind(event.target.value as typeof kind)}>
            <option value="people">Person</option>
            <option value="places">Place</option>
            <option value="topics">Topic</option>
          </select>
        </label>
        <label htmlFor={`${id}-name`} className={styles.name}>
          Name
          <input id={`${id}-name`} value={name} maxLength={120} disabled={disabled || pending} onChange={(event) => setName(event.target.value)} placeholder="Enter a name" />
        </label>
        <button type="submit" disabled={disabled || pending || !name.trim()}>{pending ? "Adding…" : "Add"}</button>
      </div>
      {pending && <p className={styles.feedback} role="status">Adding detail…</p>}
      {feedback && !pending && <p className={`${styles.feedback} ${feedback.error ? styles.error : ""}`} role={feedback.error ? "alert" : "status"}>{feedback.text}</p>}
    </form>
  );
}
