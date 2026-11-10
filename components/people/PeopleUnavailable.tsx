import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VaultShell } from "@/components/layout/VaultShell";
import { PeopleFeedback } from "./PeopleFeedback";
import styles from "./People.module.css";

export function PeopleUnavailable({ demo }: { demo: boolean }) {
  return (
    <VaultShell title="People" isDemo={demo}>
      <main className={styles.page} data-person-unavailable>
        <Link href={demo ? "/people?demo=jimmy" : "/people"} className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> All people</Link>
        <header className={styles.intro}><h1>People</h1></header>
        <PeopleFeedback>Information for this person could not be loaded. Try again to open their memories.</PeopleFeedback>
      </main>
    </VaultShell>
  );
}
