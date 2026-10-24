import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { VaultShell } from "@/components/layout/VaultShell";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "jimmy";

  let user = {
    id: "demo-jimmy",
    email: "jimmy.demo@example.com",
    fullName: "Jimmy",
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
    <VaultShell title="Settings & Data" isDemo={isDemo} userName={user.fullName}>
      <main className="min-h-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        <SettingsClient user={user} isDemo={isDemo} />
      </main>
    </VaultShell>
  );
}
