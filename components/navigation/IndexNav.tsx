"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/experience/theme-context";
import { Moon, Sun } from "lucide-react";

const SECTIONS = [
  { id: "hero", num: "00", label: "Origin" },
  { id: "transformation", num: "✦", label: "Transformation" },
  { id: "present", num: "01", label: "The Present" },
  { id: "log", num: "02", label: "Log a Moment" },
  { id: "extraction", num: "03", label: "AI Extraction" },
  { id: "reconstruction", num: "04", label: "Reconstruction" },
  { id: "numbers", num: "05", label: "By the Numbers" },
  { id: "patterns", num: "06", label: "Patterns" },
  { id: "firsts", num: "07", label: "Firsts" },
  { id: "changes", num: "08", label: "Changes" },
  { id: "insight", num: "09", label: "Signature Insight" },
  { id: "reflection", num: "10", label: "Reflection" },
  { id: "month-reconstruction", num: "11", label: "Month reconstruction" },
];

export function IndexNav() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.45) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
      el.scrollIntoView({ behavior });
    }
  };

  return (
    <>
      <aside className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <nav className="flex flex-col gap-1 border-l border-[#7893d0]/30 pl-3 text-muted" aria-label="Archive index">
          <button type="button" onClick={() => scrollTo("hero")} className="mb-3 text-left font-mono text-[10px] font-bold tracking-[0.2em] text-foreground transition-colors hover:text-brand" title="Top of Archive">LM / INDEX</button>
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                className={`group relative flex items-center gap-2 text-left text-[10px] font-mono transition-all duration-200 ${
                  isActive
                    ? "text-brand font-semibold scale-110"
                    : "text-muted/60 hover:text-foreground"
                }`}
                aria-label={`Jump to ${sec.label}`}
              >
                <span className="w-5">{sec.num}</span>
                <span className="pointer-events-none absolute left-9 whitespace-nowrap text-[10px] uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100">{sec.label}</span>

              </button>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-1 overflow-x-auto border border-[#7893d0]/25 bg-[#07152f]/95 p-1.5 shadow-lg backdrop-blur-md lg:hidden" aria-label="Mobile archive index">
        {SECTIONS.map((sec) => (
          <button type="button" key={sec.id} onClick={() => scrollTo(sec.id)} aria-label={`Jump to ${sec.label}`} className={`shrink-0 px-2 py-1.5 font-mono text-[10px] transition-colors ${activeSection === sec.id ? "bg-[#7893d0] font-semibold text-[#07152f]" : "text-[#aeb2b1] hover:bg-white/10"}`}>
            {sec.num}
          </button>
        ))}
        <button type="button" onClick={toggleTheme} className="ml-auto shrink-0 border-l border-[#7893d0]/25 px-2 py-1.5 text-[#aeb2b1]" title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`} aria-label="Toggle visual theme">
          {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-accent-gold" /> : <Moon className="h-3.5 w-3.5 text-brand" />}
        </button>
      </nav>
    </>
  );
}
