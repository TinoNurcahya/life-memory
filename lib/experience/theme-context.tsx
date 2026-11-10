"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { flushSync } from "react-dom";

export type Theme = "dark" | "light" | "system";

export interface ThemeOriginEvent {
  clientX?: number;
  clientY?: number;
  detail?: number;
  currentTarget?: EventTarget | null;
}

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  mounted: boolean;
  toggleTheme: (event?: ThemeOriginEvent) => void;
  setTheme: (theme: Theme, event?: ThemeOriginEvent) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  resolvedTheme: "light",
  mounted: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

function resolveEffectiveDark(targetTheme: Theme): boolean {
  if (targetTheme === "dark") return true;
  if (targetTheme === "light") return false;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);
  const cancelTransitionRef = useRef<(() => void) | null>(null);

  const applyTheme = useCallback((targetTheme: Theme) => {
    const effectiveDark = resolveEffectiveDark(targetTheme);
    setResolvedTheme(effectiveDark ? "dark" : "light");
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", effectiveDark);
    }
  }, []);

  useEffect(() => {
    let saved: Theme | null = null;
    try {
      const val = localStorage.getItem("lm-theme");
      if (val === "dark" || val === "light" || val === "system") {
        saved = val;
      }
    } catch {
      // storage blocked
    }

    const initialTheme: Theme = saved || "light";
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      let currentStored: string | null = null;
      try {
        currentStored = localStorage.getItem("lm-theme");
      } catch {
        /* storage blocked */
      }
      if (currentStored === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      cancelTransitionRef.current?.();
    };
  }, [applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme, event?: ThemeOriginEvent) => {
      const commit = () => {
        setThemeState(newTheme);
        try {
          localStorage.setItem("lm-theme", newTheme);
        } catch {
          /* Keep the current-session preference in state. */
        }
        applyTheme(newTheme);
      };

      if (typeof window === "undefined" || typeof document === "undefined") {
        commit();
        return;
      }

      const nextDark = resolveEffectiveDark(newTheme);
      const currentDark = document.documentElement.classList.contains("dark");
      const root = document.documentElement;
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      // Only trigger ViewTransition when an explicit click event is passed (never interfere with landing page's own ViewTransition)
      if (
        !event ||
        nextDark === currentDark ||
        cancelTransitionRef.current ||
        motionQuery.matches ||
        document.hidden ||
        typeof document.startViewTransition !== "function" ||
        typeof root.animate !== "function" ||
        typeof KeyframeEffect === "undefined" ||
        !("pseudoElement" in KeyframeEffect.prototype) ||
        !CSS.supports("selector(::view-transition-new(root))")
      ) {
        commit();
        return;
      }

      const targetEl =
        event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
      const rect = targetEl?.getBoundingClientRect();
      const rawX =
        event && typeof event.clientX === "number" && event.detail !== 0
          ? event.clientX
          : rect
            ? rect.left + rect.width / 2
            : window.innerWidth - 36;
      const rawY =
        event && typeof event.clientY === "number" && event.detail !== 0
          ? event.clientY
          : rect
            ? rect.top + rect.height / 2
            : 32;

      const x = Math.max(0, Math.min(window.innerWidth, rawX));
      const y = Math.max(0, Math.min(window.innerHeight, rawY));
      const radius =
        Math.ceil(
          Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
          )
        ) + 1;

      let committed = false;
      const commitOnce = () => {
        if (committed) return;
        committed = true;
        flushSync(() => commit());
      };

      let transition: ViewTransition | undefined;
      let animation: Animation | undefined;
      let cancelled = false;
      let cleaned = false;

      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        animation?.cancel();
        window.removeEventListener("resize", cancel);
        window.visualViewport?.removeEventListener("resize", cancel);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        motionQuery.removeEventListener("change", onMotionChange);
        root.removeAttribute("data-lm-theme-transition");
        cancelTransitionRef.current = null;
      };

      const cancel = () => {
        if (cleaned) return;
        cancelled = true;
        commitOnce();
        transition?.skipTransition();
        animation?.cancel();
        cleanup();
      };

      const onVisibilityChange = () => {
        if (document.hidden) cancel();
      };
      const onMotionChange = () => {
        if (motionQuery.matches) cancel();
      };

      cancelTransitionRef.current = cancel;
      root.setAttribute("data-lm-theme-transition", "iris");
      window.addEventListener("resize", cancel);
      window.visualViewport?.addEventListener("resize", cancel);
      document.addEventListener("visibilitychange", onVisibilityChange);
      motionQuery.addEventListener("change", onMotionChange);

      try {
        transition = document.startViewTransition(() => {
          if (!cancelled) commitOnce();
        });
        void transition.finished.then(cleanup, cancel);
        void transition.ready
          .then(() => {
            if (cancelled || cleaned) return;
            animation = root.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${radius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 500,
                easing: "cubic-bezier(.4,0,.2,1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
            void animation.finished.catch(cancel);
          })
          .catch(cancel);
      } catch {
        cancel();
      }
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(
    (event?: ThemeOriginEvent) => {
      const next = resolvedTheme === "dark" ? "light" : "dark";
      setTheme(next, event);
    },
    [resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, mounted, toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
