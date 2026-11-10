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
          <ArrowLeft size={16} aria-hidden="true" /> All topics
        </Link>
        <header className={styles.intro}><h1>Topics</h1></header>
        <TopicsFeedback>Information for this topic could not be loaded. Try again to open its memories.</TopicsFeedback>
      </main>
    </VaultShell>
  );
}
