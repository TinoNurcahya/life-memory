import { getArchiveData, type ArchiveData } from "@/lib/queries/activities";
import { JIMMY_DEMO_ITEMS, JIMMY_DEMO_STATS } from "@/lib/demo/jimmy";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const isDemo = params.demo === "jimmy";
  const archive: ArchiveData = isDemo ? { items: JIMMY_DEMO_ITEMS, stats: JIMMY_DEMO_STATS, error: null } : await getArchiveData();

  let userName: string | null = null;
  if (!isDemo) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userName = user.user_metadata?.full_name || user.email?.split("@")[0] || null;
      }
    } catch {
      // ignore
    }
  }

  return <DashboardClient initialData={archive} isDemo={isDemo} userName={userName} />;
}
