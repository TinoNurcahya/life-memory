import Link from "next/link";
import type { DirectoryEntity, EntityKind } from "@/lib/queries/entities";
import { EntityMergeControl } from "@/components/directory/EntityMergeControl";
import { VaultShell } from "@/components/layout/VaultShell";

export function EntityDetail({
  kind,
  entity,
  memories,
  candidates,
  demo,
}: {
  kind: EntityKind;
  entity: DirectoryEntity;
  memories: Array<{
    id?: string;
    summary: string;
    occurred_at?: string;
    occurredAt?: string;
    category?: string | null;
  }>;
  candidates: DirectoryEntity[];
  demo: boolean;
}) {
  const suffix = demo ? "?demo=jimmy" : "";

  return (
    <VaultShell title={entity.name} isDemo={demo}>
      <main className="min-h-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href={"/" + kind + suffix}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground transition mb-6"
          >
            ← Back to all {kind}
          </Link>

          <header className="mb-8 border-b border-hairline/80 pb-6">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              {kind.slice(0, -1)} profile
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
              {entity.name}
            </h1>
            <p className="mt-2 font-mono text-xs text-muted">
              {entity.activity_count} completed memories · first recorded {entity.first_seen_at}
            </p>
          </header>

          <div className="space-y-3">
            {memories.map((memory, index) => (
              <article
                key={memory.id ?? String(memory.occurred_at) + index}
                className="rounded-2xl border border-hairline/80 bg-surface/80 p-5 shadow-xs transition hover:border-brand/40"
              >
                <div className="flex items-center justify-between gap-3 text-xs font-mono text-muted">
                  <time>{memory.occurred_at ?? memory.occurredAt}</time>
                  {memory.category && (
                    <span className="rounded-full bg-surface-subdued px-2 py-0.5 capitalize text-[10px]">
                      #{memory.category}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-serif text-lg leading-relaxed text-foreground">
                  {memory.summary}
                </p>
              </article>
            ))}
          </div>

          {!demo && (
            <div className="mt-8">
              <EntityMergeControl
                kind={kind}
                sourceId={entity.id}
                candidates={candidates.filter((candidate) => candidate.id !== entity.id)}
              />
            </div>
          )}
        </div>
      </main>
    </VaultShell>
  );
}
