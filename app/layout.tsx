import type { Metadata } from "next";
import { ThemeScript } from "@/components/ThemeScript";
import ToasterProvider from "@/components/ui/ToasterProvider";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://life-memory.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Life Memory — Private Personal Memory Intelligence",
    template: "%s | Life Memory",
  },
  description:
    "Transform everyday micro-logs into a structured, longitudinal representation of your life. Facts before narrative, evidence before confidence.",
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
      className=""
    >
      <head>
        <ThemeScript />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-canvas text-foreground antialiased selection:bg-brand/20 selection:text-brand"
      >
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}

