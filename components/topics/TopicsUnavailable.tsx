import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VaultShell } from "@/components/layout/VaultShell";
import { TopicsFeedback } from "./TopicsFeedback";
import styles from "./Topics.module.css";

export function TopicsUnavailable({ demo }: { demo: boolean }) {
  return (
    <VaultShell title="Topics" isDemo={demo}>
      <main className={styles.page} data-topics-unavailable>
        <Link href={demo ? "/topics?demo=jimmy" : "/topics"} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" /> Semua topik
        </Link>
        <header className={styles.intro}><h1>Topics</h1></header>
        <TopicsFeedback>Informasi topik ini belum bisa dimuat. Coba lagi untuk membuka memorinya.</TopicsFeedback>
      </main>
    </VaultShell>
  );
}
