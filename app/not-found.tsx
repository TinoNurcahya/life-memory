import Link from "next/link";
import { Compass, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-foreground flex flex-col items-center justify-center px-6 py-16 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border-hairline flex items-center justify-center text-muted mb-6 shadow-sm">
        <Compass className="w-8 h-8 opacity-75" />
      </div>

      <p className="text-xs uppercase tracking-[0.25em] text-muted font-mono mb-2">
        Archive Entry 404
      </p>

      <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight max-w-md mb-3">
        This moment hasn&apos;t been logged yet.
      </h1>

      <p className="text-sm text-muted max-w-md mb-8 leading-relaxed">
        The memory coordinate or chapter you are looking for does not exist in this archive index.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-canvas font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <Compass className="w-4 h-4" />
          <span>Go to Archive Dashboard</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border-hairline text-foreground font-medium text-xs sm:text-sm hover:bg-surface-elevated transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Landing Overview</span>
        </Link>

        <Link
          href="/sitemap"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border-hairline text-foreground font-medium text-xs sm:text-sm hover:bg-surface-elevated transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>User Sitemap</span>
        </Link>
      </div>
    </div>
  );
}
