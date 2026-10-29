import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VaultShell } from "@/components/layout/VaultShell";
import { PlacesFeedback } from "./PlacesFeedback";
import styles from "./Places.module.css";

export function PlacesUnavailable({ demo }: { demo: boolean }) {
  return (
    <VaultShell title="Places" isDemo={demo}>
      <main className={styles.page} data-place-unavailable>
        <Link href={demo ? "/places?demo=jimmy" : "/places"} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" /> Semua tempat
        </Link>
        <header className={styles.intro}><h1>Places</h1></header>
        <PlacesFeedback>Informasi tempat ini belum bisa dimuat. Coba lagi untuk membuka memorinya.</PlacesFeedback>
      </main>
    </VaultShell>
  );
}
