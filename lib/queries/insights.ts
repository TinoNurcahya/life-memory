import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";
import { getArchiveData } from "./activities";
import { loadInsightsData } from "@/lib/insights/load";

export async function getInsightsData(demo = false) {
  return loadInsightsData(
    demo ? async () => ({ items: JIMMY_DEMO_ITEMS, error: null }) : getArchiveData,
    new Date().toISOString().slice(0, 10),
  );
}
