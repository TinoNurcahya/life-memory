"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addActivityEntity } from "@/app/actions/activities";

export function EntityControls({ detailId }: { detailId: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<"people" | "places" | "topics">("people");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const submit = () => {
    const val = name.trim();
    if (!val) return;
    startTransition(async () => {
      const result = await addActivityEntity(detailId, kind, val);
      if (result.success) {
        setName("");
        setMessage("Added");
        toast.success(`Added "${val}" to memory.`);
        router.refresh();
      } else {
        setMessage(result.error);
        toast.error(result.error);
      }
    });
  };
  return <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-hairline/50 pt-3"><span className="text-[10px] uppercase tracking-wider text-muted">Add entity</span><select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="rounded border border-hairline bg-surface-subdued px-2 py-1 text-[11px] text-muted"><option value="people">Person</option><option value="places">Place</option><option value="topics">Topic</option></select><input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="Name" className="min-w-28 flex-1 rounded border border-hairline bg-surface-subdued px-2 py-1 text-[11px] outline-none focus:border-brand" /><button type="button" disabled={pending || !name.trim()} onClick={submit} className="rounded bg-brand px-2.5 py-1 text-[11px] text-white disabled:opacity-50">{pending ? "Adding…" : "Add"}</button>{message && <span className="text-[10px] text-muted">{message}</span>}</div>;
}
