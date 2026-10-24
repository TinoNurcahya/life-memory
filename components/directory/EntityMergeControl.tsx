"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mergeEntity } from "@/app/actions/activities";
import type { DirectoryEntity, EntityKind } from "@/lib/queries/entities";

export function EntityMergeControl({ kind, sourceId, candidates }: { kind: EntityKind; sourceId: string; candidates: DirectoryEntity[] }) {
  const router = useRouter();
  const [targetId, setTargetId] = useState(candidates[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  if (!candidates.length) return null;

  const handleMerge = () => {
    if (!targetId || pending) return;
    const target = candidates.find((c) => c.id === targetId);
    const targetName = target?.name ?? "target entity";
    const singularKind = kind.endsWith("s") ? kind.slice(0, -1) : kind;
    const confirmed = window.confirm(
      `Are you sure you want to merge this ${singularKind} into "${targetName}"? The source entity will be permanently deleted and all its associated memories will be moved.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      setMessage("");
      const result = await mergeEntity(kind, sourceId, targetId);
      if (result.success) {
        toast.success(`Merged into "${targetName}".`);
        router.push("/" + kind);
        router.refresh();
      } else {
        setMessage(result.error);
        toast.error(result.error);
      }
    });
  };

  return <div className="mt-8 rounded-xl border border-dashed border-hairline p-4">
    <p className="text-xs font-semibold">Merge duplicate</p>
    <p className="mt-1 text-xs text-muted">Move this entity’s memories to another canonical record.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <select value={targetId} onChange={(event) => setTargetId(event.target.value)} className="rounded border border-hairline bg-surface-subdued px-2 py-1 text-xs">
        {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
      </select>
      <button type="button" disabled={pending || !targetId} onClick={handleMerge} className="rounded bg-brand px-3 py-1 text-xs text-white disabled:opacity-50">
        {pending ? "Merging…" : "Merge"}
      </button>
    </div>
    {message && <p className="mt-2 text-xs text-red-700">{message}</p>}
  </div>;
}
