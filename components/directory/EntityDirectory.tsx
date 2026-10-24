import Link from "next/link";
import type { DirectoryEntity, EntityKind } from "@/lib/queries/entities";
import { VaultShell } from "@/components/layout/VaultShell";

const labels: Record<EntityKind, { title: string; noun: string; description: string }> = {
  people: {
    title: "People",
    noun: "interactions",
    description: "The companions, collaborators, and familiar faces woven through your memories.",
  },
  places: {
    title: "Places",
    noun: "visits",
    description: "The coordinates, cafes, trails, and spaces where your memories took place.",
  },
  topics: {
    title: "Topics",
    noun: "activities",
    description: "Themes, creative pursuits, and recurring threads that define your seasons of life.",
  },
};

export function EntityDirectory({
  kind,
  items,
  demo,
}: {
  kind: EntityKind;
  items: DirectoryEntity[];
  demo: boolean;
}) {
  const copy = labels[kind];
  const suffix = demo ? "?demo=jimmy" : "";

  return (
    <VaultShell title={copy.title} isDemo={demo}>
      <main className="min-h-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Constellation Directory · {demo ? "Demo Vault" : "Personal Archive"}
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal tracking-tight">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted leading-relaxed">
              {copy.description}
            </p>
          </div>

          {/* Directory Filter Pills */}
          <nav aria-label="Entity tabs" className="mb-6 flex flex-wrap gap-2">
            {(["people", "places", "topics"] as EntityKind[]).map((value) => {
              const active = value === kind;
              return (
                <Link
                  key={value}
                  href={"/" + value + suffix}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs capitalize transition ${
                    active
                      ? "border border-brand/30 bg-brand/10 font-semibold text-brand"
                      : "border border-hairline bg-surface text-muted hover:border-brand/20 hover:text-foreground"
                  }`}
                >
                  {value}
                </Link>
              );
            })}
          </nav>

          {/* Entities Grid */}
          {!items.length ? (
            <div className="rounded-2xl border border-dashed border-hairline p-12 text-center text-sm text-muted">
              No {kind} found yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-hairline/80 bg-surface/80 p-5 shadow-xs transition hover:border-brand/40 hover:bg-surface"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl font-medium text-foreground truncate">
                        {item.name}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-muted">
                        {item.first_seen_at} → {item.last_seen_at}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 font-mono text-xs text-brand font-medium">
                      {item.activity_count} {copy.noun}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </VaultShell>
  );
}
