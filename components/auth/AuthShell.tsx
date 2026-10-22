"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { ThemeProvider } from "@/lib/experience/theme-context";

type AuthVariant = "login" | "register";

interface AuthShellProps {
  variant: AuthVariant;
  children: ReactNode;
  onDemoRequest?: () => void;
}

const content = {
  login: {
    image: "/images/library/morning-kitchen.png",
    video: "/videos/library/morning-kitchen-light.mp4",
    alt: "Morning kitchen table in soft dawn light",
    line: ["Your ordinary days", "belong here."],
    title: "Welcome back",
    description: "Return to the moments you’ve kept.",
    switchText: "Don't have an archive yet?",
    switchLabel: "Create your archive",
    switchHref: "/register",
  },
  register: {
    image: "/images/library/notebook-hands.png",
    video: "/videos/library/notebook-pages.mp4",
    alt: "Hands writing in a quiet personal journal",
    line: ["Start with one", "small moment."],
    title: "Begin your archive",
    description: "A place for the moments that make a life.",
    switchText: "Already have an archive?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
} as const;

function useAmbientVideoAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const connection = (navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        addEventListener?: (event: string, listener: () => void) => void;
        removeEventListener?: (event: string, listener: () => void) => void;
      };
    }).connection;
    const update = () => setAllowed(media.matches && !connection?.saveData);
    update();
    media.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      media.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  return allowed;
}

function EditorialMedia({ variant }: { variant: AuthVariant }) {
  const config = content[variant];
  const reducedMotion = useReducedMotion();
  const videoAllowed = useAmbientVideoAllowed();
  const stageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useRef(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!videoAllowed || !video || !stage) return;

    let active = true;
    const playWhenAppropriate = () => {
      if (document.hidden || !inView.current) return;
      void video.play().catch(() => { if (active) setVideoPlaying(false); });
    };
    const onPlaying = () => { if (active) setVideoPlaying(true); };
    const onPause = () => { if (active) setVideoPlaying(false); };
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else playWhenAppropriate();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      if (entry.isIntersecting) playWhenAppropriate();
      else video.pause();
    }, { threshold: 0.1 });

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onPause);
    document.addEventListener("visibilitychange", onVisibility);
    video.src = config.video;
    observer.observe(stage);

    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onPause);
      video.pause();
      video.removeAttribute("src");
      video.load();
      inView.current = false;
      setVideoPlaying(false);
    };
  }, [config.video, videoAllowed]);

  return (
    <aside ref={stageRef} className="relative h-36 overflow-hidden border-b border-hairline bg-surface-subdued lg:col-span-5 lg:h-auto lg:min-h-screen lg:border-b-0 lg:border-r">
      <Image src={config.image} alt={config.alt} fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover object-center" />
      {videoAllowed && <video ref={videoRef} muted loop playsInline preload="none" aria-hidden="true" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoPlaying ? "opacity-100" : "opacity-0"}`} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35" />
      <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white lg:min-h-screen lg:p-10">
        <Link href="/" className="inline-flex min-h-11 w-fit items-center gap-2 text-sm text-white/90 transition-colors hover:text-white lg:text-xs">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Return to archive
        </Link>
        <div className="flex items-end justify-between gap-4 lg:block">
          <div>
            <p className="hidden text-xs font-medium uppercase tracking-[0.18em] text-white/80 lg:block">Life Memory</p>
            <p className="font-serif text-2xl leading-tight lg:mt-5 lg:text-[clamp(2.5rem,3.5vw,4rem)] lg:leading-[1.06]" aria-label={config.line.join(" ")}>
              {config.line.map((line, index) => (
                <motion.span key={line} aria-hidden="true" className="block" initial={reducedMotion === false ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.65 + index * 0.07 }}>
                  {line}
                </motion.span>
              ))}
            </p>
          </div>
        </div>
      </div>
      {reducedMotion === false && <>
        <motion.div aria-hidden="true" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }} className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 origin-left bg-canvas" />
        <motion.div aria-hidden="true" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }} className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 origin-right bg-canvas" />
      </>}
    </aside>
  );
}

export function AuthShell({ variant, children, onDemoRequest }: AuthShellProps) {
  const reducedMotion = useReducedMotion();
  const config = content[variant];

  return <ThemeProvider><div className="min-h-screen bg-canvas text-foreground lg:grid lg:grid-cols-12">
    <EditorialMedia variant={variant} />
    <main className="flex min-h-[calc(100vh-9rem)] min-w-0 flex-col px-5 py-8 sm:px-10 lg:col-span-7 lg:min-h-screen lg:px-12 xl:px-16">
      <div className="mx-auto flex w-full max-w-md justify-end text-xs uppercase tracking-[0.16em] text-muted">{variant === "login" ? "Sign in" : "New archive"}</div>
      <div className="mx-auto my-auto w-full max-w-md py-8 lg:py-12">
        <motion.div initial={reducedMotion === false ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-8">
          <h1 className="font-serif text-[2.5rem] leading-[1.05] tracking-tight sm:text-5xl">{config.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{config.description}</p>
        </motion.div>
        {children}
        <div className="mt-7 border-t border-hairline pt-6">
          <div className="rounded-2xl border border-hairline bg-surface p-4">
            <p className="font-serif text-xl">Explore Jimmy&apos;s demo</p>
            <p className="mt-1 text-sm text-muted">Use the sample archive without signing in.</p>
            {variant === "register" ?
              <Link href="/dashboard?demo=jimmy" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-strong px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-subdued">Explore Jimmy&apos;s demo</Link> :
              <button type="button" onClick={onDemoRequest} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-strong px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-subdued">Explore Jimmy&apos;s demo</button>}
          </div>
          <p className="mt-6 text-center text-sm text-muted">{config.switchText} <Link href={config.switchHref} className="inline-flex min-h-11 items-center font-medium text-brand underline-offset-4 hover:underline">{config.switchLabel}</Link></p>
        </div>
      </div>
    </main>
  </div></ThemeProvider>;
}

export function AuthSubmitLabel({ idle, pending, isSubmitting }: { idle: string; pending: string; isSubmitting: boolean }) {
  if (isSubmitting) return <span className="inline-flex items-center gap-2">{pending}<span aria-hidden="true" className="inline-flex gap-1 motion-reduce:hidden"><i className="h-1 w-1 animate-pulse rounded-full bg-current" /><i className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:150ms]" /><i className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:300ms]" /></span></span>;
  return <span className="relative block overflow-hidden"><span className="block transition-transform duration-300 group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transform-none motion-reduce:transition-none">{idle}</span><span aria-hidden="true" className="absolute inset-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:hidden">{idle}</span></span>;
}

export function AuthStatus({ message, tone }: { message: string; tone: "error" | "success" }) {
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${tone === "error" ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"}`}>{message}</div>;
}
