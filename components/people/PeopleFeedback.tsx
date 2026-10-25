"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./People.module.css";

export function PeopleFeedback({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className={styles.notice} role="alert" aria-busy={pending}>
      <p>{children}</p>
      <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
        {pending ? "Memuat ulang…" : "Coba lagi"}
      </button>
    </div>
  );
}
