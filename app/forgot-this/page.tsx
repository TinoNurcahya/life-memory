import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";
import { getArchiveData } from "@/lib/queries/activities";
import { selectAllForgottenCandidates } from "@/lib/queries/forgotten";
import { VaultShell } from "@/components/layout/VaultShell";
import { ForgottenClient } from "@/components/forgotten/ForgottenClient";

export default async function ForgotThisPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const demo = (await searchParams).demo === "jimmy";
  const archive = demo ? { items: JIMMY_DEMO_ITEMS } : await getArchiveData();
  const candidates = selectAllForgottenCandidates(archive.items);

  return (
    <VaultShell title="Forgotten Memory" isDemo={demo} items={archive.items}>
      <ForgottenClient candidates={candidates} demo={demo} />
    </VaultShell>
  );
}
