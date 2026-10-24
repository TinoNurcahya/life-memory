import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";
import { getArchiveData } from "@/lib/queries/activities";
import { selectForgottenCandidate } from "@/lib/queries/forgotten";
import { VaultShell } from "@/components/layout/VaultShell";

export default async function ForgotThisPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const demo = (await searchParams).demo === "jimmy";
  const archive = demo ? { items: JIMMY_DEMO_ITEMS } : await getArchiveData();
  const item = selectForgottenCandidate(archive.items);

  return (
    <VaultShell title="Forgotten Memory (S-14)" isDemo={demo} items={archive.items}>
      <main className="min-h-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              S-14 Dormancy Algorithm · Memory Reopening
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal tracking-tight">
              A memory worth reopening
            </h1>
            <p className="mt-2 text-sm text-muted">
              Authentic moments from your archive dormant for over 21 days surfaced to rekindle long-term perspective.
            </p>
          </div>

          {item ? (
            <article className="mt-6 rounded-3xl border border-brand/30 bg-surface/85 p-6 sm:p-10 shadow-xs">
              <div className="flex items-center justify-between border-b border-hairline/60 pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-brand font-medium">
                  S-14 · Surfaced from {item.daysAgo} days ago
                </span>
                <span className="rounded-full bg-surface-subdued px-2.5 py-0.5 font-mono text-[11px] text-muted">
                  #{item.category}
                </span>
              </div>
              <p className="mt-6 font-serif text-xl sm:text-2xl leading-relaxed text-foreground">
                &ldquo;{item.summary}&rdquo;
              </p>
              <p className="mt-6 font-mono text-xs text-muted">
                Recorded on {item.occurredAt}
              </p>
            </article>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-hairline bg-surface/40 p-10 text-center text-sm text-muted">
              No completed memory has an anchor that has stayed dormant for 21 days yet.
            </div>
          )}
        </div>
      </main>
    </VaultShell>
  );
}
