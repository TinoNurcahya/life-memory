"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { ArrowUpRight, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/experience/theme-context";
import { RollingText } from "@/components/ui/RollingText";

const chapters = [["hero", "Origin"], ["ordinary", "Ordinary days"], ["reconstruction", "Fragments"], ["patterns", "Taking shape"], ["firsts", "First times"], ["rediscovery", "Rediscovery"], ["closing", "Keep what matters"]] as const;

export function ArchiveNavigation({ introReady }: { introReady?: boolean } = {}) {
  const { theme, mounted, setTheme } = useTheme();
  const [active, setActive] = useState<string>("hero");
  const [headerHidden, setHeaderHidden] = useState(false);
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const navigationMounted = useRef(true);
  const cancelThemeTransition = useRef<(() => void) | null>(null);

  useEffect(() => {
    navigationMounted.current = true;
    return () => {
      navigationMounted.current = false;
      cancelThemeTransition.current?.();
    };
  }, []);

  useEffect(() => {
    if (introReady === false) return;

    const startIntro = setTimeout(() => {
      if (navigationMounted.current) setIntroActive(true);
    }, 200);
    const stopIntro = setTimeout(() => {
      if (navigationMounted.current) setIntroActive(false);
    }, 2400);

    return () => {
      clearTimeout(startIntro);
      clearTimeout(stopIntro);
    };
  }, [introReady]);

  const changeTheme = (event: MouseEvent<HTMLButtonElement>) => {
    if (cancelThemeTransition.current) return;

    const root = document.documentElement;
    const nextTheme = theme === "dark" ? "light" : "dark";
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let committed = false;
    const commitTheme = () => {
      if (committed || !navigationMounted.current) return;
      committed = true;
      flushSync(() => setTheme(nextTheme));
    };

    if (
      motionQuery.matches || document.hidden ||
      typeof document.startViewTransition !== "function" ||
      typeof root.animate !== "function" ||
      typeof KeyframeEffect === "undefined" || !("pseudoElement" in KeyframeEffect.prototype) ||
      !CSS.supports("selector(::view-transition-new(root))")
    ) {
      commitTheme();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(innerWidth, event.detail === 0 ? rect.left + rect.width / 2 : event.clientX));
    const y = Math.max(0, Math.min(innerHeight, event.detail === 0 ? rect.top + rect.height / 2 : event.clientY));
    const radius = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))) + 1;
    let transition: ViewTransition | undefined;
    let animation: Animation | undefined;
    let cancelled = false;
    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      // The browser can skip a view transition before its WAAPI animation ends.
      animation?.cancel();
      window.removeEventListener("resize", cancel);
      window.visualViewport?.removeEventListener("resize", cancel);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionChange);
      root.removeAttribute("data-lm-theme-transition");
      cancelThemeTransition.current = null;
      if (navigationMounted.current) setThemeTransitioning(false);
    };
    const cancel = () => {
      if (cleaned) return;
      cancelled = true;
      // A skipped transition can still call its update callback. Commit only once.
      commitTheme();
      transition?.skipTransition();
      animation?.cancel();
      cleanup();
    };
    const onVisibilityChange = () => { if (document.hidden) cancel(); };
    const onMotionChange = () => { if (motionQuery.matches) cancel(); };

    cancelThemeTransition.current = cancel;
    setThemeTransitioning(true);
    root.setAttribute("data-lm-theme-transition", "iris");
    window.addEventListener("resize", cancel);
    window.visualViewport?.addEventListener("resize", cancel);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener("change", onMotionChange);

    try {
      transition = document.startViewTransition(() => { if (!cancelled) commitTheme(); });
      void transition.finished.then(cleanup, cancel);
      void transition.ready.then(() => {
        if (cancelled || cleaned) return;
        animation = root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 500, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" }
        );
        void animation.finished.catch(cancel);
      }).catch(cancel);
    } catch {
      cancel();
    }
  };

  useEffect(() => {
    let frame = 0;
    let previousScrollY = window.scrollY;
    const update = () => {
      frame = 0;
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 16) {
        setHeaderHidden(false);
      } else if (currentScrollY > previousScrollY + 4) {
        setHeaderHidden(true);
      } else if (currentScrollY < previousScrollY - 4) {
        setHeaderHidden(false);
      }
      previousScrollY = currentScrollY;
      const chapter = [...chapters].reverse().find(([id]) => {
        const el = document.getElementById(id);
        return el && el.getBoundingClientRect().top <= window.innerHeight * 0.48;
      });
      setActive(chapter?.[0] || "hero");
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return (
    <>
      <header className={`lm-header${headerHidden ? " is-hidden" : ""}${introActive ? " is-intro" : ""}`}>
        <a href="#hero" className="lm-wordmark" aria-label="Life Memory, back to top">
          <span className="lm-brand-icon" aria-hidden="true">✳</span>
          <span className="lm-brand-text">
            {"life memory".split("").map((char, i) => (
              <span
                key={i}
                className="lm-brand-char"
                style={{ "--char-index": i } as React.CSSProperties}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
          <span className="lm-brand-period">.</span>
        </a>
        <span className="lm-header-description lm-meta">An ongoing collection</span>
        <div className="lm-header-actions">
          <button
            suppressHydrationWarning
            onClick={changeTheme}
            type="button"
            aria-disabled={themeTransitioning || undefined}
            aria-label={`Switch to ${mounted && theme === "dark" ? "light" : "dark"} theme`}
            className="lm-theme-toggle"
          >
            {mounted && theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/dashboard?demo=jimmy" className="lm-demo-link group"><RollingText text="Explore demo" /> <ArrowUpRight size={14} /></Link>
        </div>
      </header>
      <nav className="lm-index" aria-label="Archive chapters">
        <span className="lm-index-label lm-meta">Index</span>
        {chapters.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-label={label} aria-current={active === id ? "location" : undefined}>
            <span className="lm-index-dot" aria-hidden="true" /> <span className="lm-index-name">{label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
