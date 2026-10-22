"use client";

import Link from "next/link";
import { useTheme } from "@/lib/experience/theme-context";
import { Compass, Moon, Sun } from "lucide-react";

export function TopHeader() {
  const { theme, mounted, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-8 lg:px-10">
      <nav
        aria-label="Main Navigation"
        className="mx-auto flex h-12 max-w-[1440px] items-center justify-between border border-[#7893d0]/20 bg-[#07152f]/90 px-3.5 shadow-lg shadow-[#07152f]/20 backdrop-blur-md sm:px-5"
      >
        <Link href="/" className="flex items-center gap-2.5 text-[#e9e5dc]">
          <span className="flex h-7 w-7 items-center justify-center bg-[#7893d0] font-mono text-[10px] font-bold text-[#07152f]">LM</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em]">Life Memory</span>
          <span className="hidden border-l border-[#7893d0]/30 pl-2.5 text-[10px] font-mono text-[#aeb2b1] sm:inline">Public archive</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            suppressHydrationWarning
            type="button"
            onClick={toggleTheme}
            className="p-2 text-[#aeb2b1] transition-colors hover:text-[#e9e5dc]"
            title={`Switch to ${mounted && theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? <Sun className="h-4 w-4 text-accent-gold" /> : <Moon className="h-4 w-4 text-brand" />}
          </button>
          <Link href="/login" className="hidden px-2.5 py-1.5 text-xs font-mono text-[#aeb2b1] transition-colors hover:text-[#e9e5dc] sm:inline-flex">Sign in</Link>
          <Link href="/dashboard?demo=jimmy" className="group inline-flex items-center gap-1.5 bg-[#7893d0] px-3 py-1.5 text-xs font-medium text-[#07152f] transition-colors hover:bg-[#a5b8ea]">
            <Compass className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
            <span>Demo</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
