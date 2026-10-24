import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFullArchiveExport } from "@/lib/export/archive";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get("demo") === "jimmy";

  if (isDemo) {
    const exportData = await getFullArchiveExport({ isDemo: true });
    const filename = `life-memory-export-demo-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // Authenticated export
  try {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to export your archive." },
        { status: 401 }
      );
    }

    const exportData = await getFullArchiveExport({
      userId: userData.user.id,
      isDemo: false,
    });

    const filename = `life-memory-export-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[ExportAPI] Error exporting archive:", err);
    return NextResponse.json(
      { error: "Internal Server Error while compiling export." },
      { status: 500 }
    );
  }
}
