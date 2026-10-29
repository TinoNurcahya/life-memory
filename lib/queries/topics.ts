import { getEntityDirectory } from "@/lib/queries/entities";
import { getArchiveData } from "@/lib/queries/activities";
import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";
import { buildTopicsData } from "@/lib/topics/model";

// One directory request and one archive batch per page, regardless of topic count.
// Each result has its own error state so directory data survives an archive failure.
export async function getTopicsData(demo = false) {
  const [directory, archive] = await Promise.allSettled([
    getEntityDirectory("topics", demo),
    demo ? Promise.resolve({ items: JIMMY_DEMO_ITEMS, error: null }) : getArchiveData(),
  ]);
  const directoryError = directory.status === "rejected" || Boolean(directory.value.error);
  const memoriesError = archive.status === "rejected" || Boolean(archive.value.error);
  const data = buildTopicsData(
    directory.status === "fulfilled" && !directoryError ? directory.value.items : [],
    archive.status === "fulfilled" && !memoriesError ? archive.value.items : [],
  );
  return { ...data, directoryError, memoriesError };
}
