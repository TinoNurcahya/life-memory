"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Compass } from "lucide-react";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("App boundary error caught", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas text-foreground flex flex-col items-center justify-center px-6 py-16 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border-hairline flex items-center justify-center text-cat-health-text mb-6 shadow-sm">
        <AlertCircle className="w-7 h-7" />
      </div>

      <p className="text-xs uppercase tracking-[0.25em] text-muted font-mono mb-2">
        System Anomaly · 500
      </p>

      <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight max-w-lg mb-3">
        An unexpected disturbance interrupted the archive.
      </h1>

      <p className="text-sm text-muted max-w-md mb-6 leading-relaxed">
        The memory record could not be processed cleanly. Your logged memories remain safe in cold storage.
      </p>

      {error.digest && (
        <div className="font-mono text-[11px] text-faint px-3 py-1.5 rounded bg-surface border border-border-hairline mb-8">
          Trace: {error.digest}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-canvas font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Operation</span>
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border-hairline text-foreground font-medium text-xs sm:text-sm hover:bg-surface-elevated transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
