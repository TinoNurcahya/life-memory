"use client";

import Link from "next/link";
import { Compass, MessageSquare } from "lucide-react";

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-hairline/80 bg-surface/80 backdrop-blur-md text-muted font-sans ${className}`}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 text-foreground font-serif text-lg font-medium tracking-tight">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand/10 font-mono text-[10px] font-bold text-brand">LM</span>
              <span>Life Memory</span>
            </Link>
            <p className="text-xs leading-relaxed text-muted">
              An archive of being alive. Transforming raw daily prose into a living constellation of autobiographical memories, grounded insights, and deep reflection.
            </p>
            <p className="font-mono text-[11px] text-faint">
              © {new Date().getFullYear()} Life Memory Inc. Zero model training guaranteed.
            </p>
          </div>

          {/* Col 2: Product & Intelligence */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-foreground">Archive Experience</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard?demo=jimmy" className="transition hover:text-foreground">
                  Dashboard Preview
                </Link>
              </li>
              <li>
                <Link href="/timeline?demo=jimmy" className="transition hover:text-foreground">
                  Chronological Timeline
                </Link>
              </li>
              <li>
                <Link href="/insights?demo=jimmy" className="transition hover:text-foreground">
                  Pattern Insights & Evidence
                </Link>
              </li>
              <li>
                <Link href="/reflection?demo=jimmy" className="transition hover:text-foreground">
                  Monthly Reflection Essay
                </Link>
              </li>
              <li>
                <Link href="/chat?demo=jimmy" className="inline-flex items-center gap-1.5 text-brand hover:underline font-medium">
                  <MessageSquare className="h-3 w-3" />
                  <span>Tanya AI (Chat Assistant)</span>
                </Link>
              </li>
              <li>
                <Link href="/forgot-this?demo=jimmy" className="transition hover:text-foreground">
                  S-14 Forgotten Memory Reveal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust & Legal */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-foreground">Trust & Governance</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="transition hover:text-foreground">
                  About Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-foreground">
                  Privacy Policy (GDPR / AI)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition hover:text-foreground">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="transition hover:text-foreground">
                  AI Safety & Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Navigation & Access */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-foreground">Directory & Access</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sitemap" className="transition hover:text-foreground font-mono">
                  Visual User Sitemap
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-foreground">
                  Sign In to Private Archive
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-foreground">
                  Create New Archive
                </Link>
              </li>
              <li>
                <Link href="/settings" className="transition hover:text-foreground">
                  Data Portability & Export
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/dashboard?demo=jimmy"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand/20 bg-brand/5 px-2.5 py-1 font-mono text-[11px] text-brand transition hover:bg-brand/10"
                >
                  <Compass className="h-3 w-3" />
                  <span>Interactive Jimmy Demo</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-hairline/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-faint">
          <p>Built with Google Gemini 3.5 & 3.8 Flash · Supabase PostgreSQL RLS</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <span>·</span>
            <Link href="/faq" className="hover:text-foreground">FAQ</Link>
            <span>·</span>
            <Link href="/sitemap" className="hover:text-foreground">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
