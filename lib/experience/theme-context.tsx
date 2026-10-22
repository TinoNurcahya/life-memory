"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  mounted: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  resolvedTheme: "light",
  mounted: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((targetTheme: Theme) => {
    let effectiveDark = false;
    if (targetTheme === "dark") {
      effectiveDark = true;
    } else if (targetTheme === "light") {
      effectiveDark = false;
    } else {
      // system mode: follow OS preference
      effectiveDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    setResolvedTheme(effectiveDark ? "dark" : "light");
    if (typeof document !== "undefined") {
      if (effectiveDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  useEffect(() => {
    // Read saved preference
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

    // Listen for OS system theme changes
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
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [applyTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("lm-theme", newTheme);
    } catch {
      /* Keep the current-session preference in state. */
    }
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    // Quick toggle alternates between dark and light
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, mounted, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
