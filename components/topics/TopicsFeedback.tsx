"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./Topics.module.css";

export function TopicsFeedback({ children }: { children: ReactNode }) {
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
