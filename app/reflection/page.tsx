import Link from "next/link";
import { Calendar } from "lucide-react";
import { getOrGenerateMonthlyReflection } from "@/app/actions/activities";
import { ReflectionView } from "@/components/reflection/ReflectionView";
import { VaultShell } from "@/components/layout/VaultShell";

export default async function ReflectionPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; month?: string }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "jimmy";
  const targetMonth = params.month || new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM

  const result = await getOrGenerateMonthlyReflection(targetMonth, isDemo);

  return (
    <VaultShell title="Monthly Reflection" isDemo={isDemo}>
      <main className="min-h-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        {result.success ? (
          <ReflectionView initialEssay={result.data} targetMonth={targetMonth} demo={isDemo} />
        ) : (
          <div className="mx-auto max-w-xl text-center pt-16">
            <div className="rounded-3xl border border-dashed border-hairline bg-surface/50 p-8 sm:p-12">
              <Calendar className="mx-auto h-8 w-8 text-muted/60" />
              <h1 className="mt-4 font-serif text-2xl">No memories for {targetMonth}</h1>
              <p className="mt-2 text-sm text-muted">
                {result.error || "Log completed activities to unlock a footnote-grounded monthly reflection."}
              </p>
              <div className="mt-6">
                <Link
                  href={isDemo ? "/timeline?demo=jimmy" : "/timeline"}
                  className="inline-flex rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-hover"
                >
                  View Timeline
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </VaultShell>
  );
}
