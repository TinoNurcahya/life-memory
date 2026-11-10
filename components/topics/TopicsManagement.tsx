"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mergeEntity } from "@/app/actions/activities";
import type { DirectoryEntity } from "@/lib/queries/entities";
import styles from "./Topics.module.css";

export function TopicsManagement({ topic, candidates, demo }: {
  topic: DirectoryEntity;
  candidates: DirectoryEntity[];
  demo: boolean;
}) {
  const selectId = useId();
  const router = useRouter();
  const busy = useRef(false);
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const targets = candidates.filter(candidate => candidate.id !== topic.id);
  const target = targets.find(candidate => candidate.id === targetId);
  if (demo || !targets.length) return null;

  const merge = () => {
    if (!target || pending || busy.current) return;
    if (!window.confirm('Merge "' + topic.name + '" into "' + target.name + '"? All of its memories will be moved and "' + topic.name + '" will be permanently deleted.')) return;
    busy.current = true;
    startTransition(async () => {
      setMessage("");
      try {
        const result = await mergeEntity("topics", topic.id, target.id);
        if (result.success) {
          toast.success('Merged into "' + target.name + '".');
          router.push("/topics");
          router.refresh();
        } else {
          setMessage(result.error);
        }
      } catch {
        setMessage("Merge failed. Please try again.");
      } finally {
        busy.current = false;
      }
    });
  };

  return (
    <details className={styles.management} data-topics-management>
      <summary>Manage</summary>
      <div className={styles.managementBody} aria-busy={pending}>
        <h2>Merge duplicate topic</h2>
        <p>Use this if the same topic was recorded more than once. Memories will be moved to the topic you select.</p>
        <label htmlFor={selectId}>Merge into</label>
        <div className={styles.mergeControls}>
          <select
            id={selectId} value={targetId} disabled={pending}
            onChange={event => { setTargetId(event.target.value); setMessage(""); }}
          >
            <option value="">Select topic…</option>
            {targets.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
          </select>
          <button type="button" disabled={!target || pending} onClick={merge}>
            {pending ? "Merging…" : "Merge"}
          </button>
        </div>
        {message && <p role="alert" className={styles.mergeError}>{message}</p>}
      </div>
    </details>
  );
}
