import localFont from "next/font/local";

// Apply these variable classes to the dashboard shell and its portals only.
export const dashboardSans = localFont({
  src: "./fonts/inter-latin-variable.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  fallback: ["Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const dashboardSerif = localFont({
  src: [
    {
      path: "./fonts/newsreader-latin-variable.woff2",
      weight: "400 600",
      style: "normal",
    },
    {
      path: "./fonts/newsreader-latin-italic-variable.woff2",
      weight: "400 600",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-newsreader",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});
