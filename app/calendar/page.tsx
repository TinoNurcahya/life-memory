import { getArchiveData } from "@/lib/queries/activities";
import { JIMMY_DEMO_ITEMS, JIMMY_DEMO_STATS } from "@/lib/demo/jimmy";
import { VisualCalendar } from "@/components/calendar/VisualCalendar";
import { VaultShell } from "@/components/layout/VaultShell";
import styles from "@/components/calendar/VisualCalendar.module.css";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "jimmy";
  const data = isDemo
    ? { items: JIMMY_DEMO_ITEMS, stats: JIMMY_DEMO_STATS, error: null }
    : await getArchiveData();

  return (
    <VaultShell title="Visual Calendar" isDemo={isDemo} items={data.items}>
      <main className={styles.page} data-calendar-page>
        {data.error && <p role="alert" className={styles.error}>{data.error}</p>}
        <VisualCalendar initialItems={data.items} demo={isDemo} initialToday={new Date().toISOString().slice(0, 10)} />
      </main>
    </VaultShell>
  );
}
