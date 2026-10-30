import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";
import { createClient } from "@/lib/supabase/server";
import { getArchiveData } from "./activities";
import { loadReflectionPage } from "@/lib/reflection/service";

export async function getReflectionData(month: string | undefined, demo = false) {
  return loadReflectionPage(month, demo, {
    readArchive: demo ? async () => ({ items: JIMMY_DEMO_ITEMS, error: null }) : getArchiveData,
    readCached: async targetMonth => {
      const supabase = await createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) return { value: null, error: "Session unavailable" };
      const { data, error } = await supabase.from("insights").select("metadata")
        .eq("user_id", auth.user.id).eq("type", "reflection").filter("metadata->>month", "eq", targetMonth)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      const metadata = data?.metadata;
      return {
        value: metadata && typeof metadata === "object" && !Array.isArray(metadata) && "formatted" in metadata ? metadata.formatted : null,
        error: error?.message ?? null,
      };
    },
  }, new Date().toISOString().slice(0, 7));
}
