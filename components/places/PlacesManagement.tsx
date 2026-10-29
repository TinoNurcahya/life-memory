"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mergeEntity } from "@/app/actions/activities";
import type { DirectoryEntity } from "@/lib/queries/entities";
import styles from "./Places.module.css";

export function PlacesManagement({ place, candidates, demo }: {
  place: DirectoryEntity;
  candidates: DirectoryEntity[];
  demo: boolean;
}) {
  const selectId = useId();
  const router = useRouter();
  const busy = useRef(false);
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const targets = candidates.filter(candidate => candidate.id !== place.id);
  const target = targets.find(candidate => candidate.id === targetId);
  if (demo || !targets.length) return null;

  const merge = () => {
    if (!target || pending || busy.current) return;
    if (!window.confirm('Gabungkan "' + place.name + '" ke "' + target.name + '"? Semua memorinya akan dipindahkan dan data tempat "' + place.name + '" akan dihapus permanen.')) return;
    busy.current = true;
    startTransition(async () => {
      setMessage("");
      try {
        const result = await mergeEntity("places", place.id, target.id);
        if (result.success) {
          toast.success('Digabungkan ke "' + target.name + '".');
          router.push("/places");
          router.refresh();
        } else {
          setMessage(result.error);
        }
      } catch {
        setMessage("Penggabungan gagal. Coba lagi.");
      } finally {
        busy.current = false;
      }
    });
  };

  return (
    <details className={styles.management} data-places-management>
      <summary>Pengelolaan</summary>
      <div className={styles.managementBody} aria-busy={pending}>
        <h2>Gabungkan tempat yang sama</h2>
        <p>Gunakan jika tempat ini tercatat lebih dari sekali. Memori akan dipindahkan ke nama yang kamu pilih.</p>
        <label htmlFor={selectId}>Gabungkan ke</label>
        <div className={styles.mergeControls}>
          <select
            id={selectId} value={targetId} disabled={pending}
            onChange={event => { setTargetId(event.target.value); setMessage(""); }}
          >
            <option value="">Pilih tempat…</option>
            {targets.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
          </select>
          <button type="button" disabled={!target || pending} onClick={merge}>
            {pending ? "Menggabungkan…" : "Gabungkan"}
          </button>
        </div>
        {message && <p role="alert" className={styles.mergeError}>{message}</p>}
      </div>
    </details>
  );
}
