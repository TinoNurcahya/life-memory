import { createClient } from "@/lib/supabase/server";
import { JIMMY_DEMO_ITEMS, JIMMY_DEMO_STATS } from "@/lib/demo/jimmy";
import { timelineToAnalytics } from "@/lib/analytics/adapters";
import { detectFirstTimes } from "@/lib/analytics/first-time";
import { getArchiveData, type ArchiveData } from "@/lib/queries/activities";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { VaultShell } from "@/components/layout/VaultShell";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "jimmy";

  const archive: ArchiveData = isDemo
    ? { items: JIMMY_DEMO_ITEMS, stats: JIMMY_DEMO_STATS, error: null }
    : await getArchiveData();

  const detectedFirstTimes = detectFirstTimes(timelineToAnalytics(archive.items)).length;
  const stats = {
    ...archive.stats,
    firstTimes: detectedFirstTimes || archive.stats.firstTimes,
  };

  let user = {
    id: "demo-jimmy",
    email: "jimmy.demo@example.com" as string | null,
    fullName: "Jimmy" as string | null,
  };

  if (!isDemo) {
    try {
      const supabase = await createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", userData.user.id)
          .single();

        user = {
          id: userData.user.id,
          email: profile?.email || userData.user.email || null,
          fullName: profile?.full_name || null,
        };
      }
    } catch {
      // In case Supabase auth throws or runs offline
    }
  }

  return (
    <VaultShell
      title="Settings & Data"
      isDemo={isDemo}
      userName={user.fullName}
      items={archive.items}
    >
      <SettingsClient user={user} stats={stats} isDemo={isDemo} />
    </VaultShell>
  );
}
