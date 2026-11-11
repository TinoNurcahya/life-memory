import type { Metadata } from "next";
import { ThemeScript } from "@/components/ThemeScript";
import ToasterProvider from "@/components/ui/ToasterProvider";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lifememory.tinonurcahya.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Life Memory — Private Personal Memory Intelligence",
    template: "%s | Life Memory",
  },
  description:
    "Transform everyday micro-logs into a structured, longitudinal representation of your life. Facts before narrative, evidence before confidence.",
  verification: {
    google: "o8eULBXa-J8QVz-28-Yr4t_aGDZy4vg8aUp3SD_X1j0",
  },
  openGraph: {
    title: "Life Memory — Private Personal Memory Intelligence",
    description: "Transform everyday micro-logs into a structured representation of your life.",
    url: BASE_URL,
    siteName: "Life Memory",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dashboardSans.variable} ${dashboardSerif.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-canvas text-foreground font-sans antialiased selection:bg-brand/20 selection:text-brand"
      >
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}

