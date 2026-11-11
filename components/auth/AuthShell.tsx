"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Moon, Sun } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeProvider, useTheme } from "@/lib/experience/theme-context";
import styles from "./Auth.module.css";

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
    subnote: "Every brief sentence you keep becomes a searchable chapter of your life.",
    indexLabel: "01 — Sign in",
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
    subnote: "No folders or complex tags required. Write naturally and let your archive grow.",
    indexLabel: "01 — New archive",
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
      void video.play().catch(() => {
        if (active) setVideoPlaying(false);
      });
    };
    const onPlaying = () => {
      if (active) setVideoPlaying(true);
    };
    const onPause = () => {
      if (active) setVideoPlaying(false);
    };
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else playWhenAppropriate();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) playWhenAppropriate();
        else video.pause();
      },
      { threshold: 0.1 }
    );

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
    <aside ref={stageRef} className={styles.mediaColumn}>
      <Image
        src={config.image}
        alt={config.alt}
        fill
        priority
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover object-center"
      />
      {videoAllowed && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            videoPlaying ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      <div className={styles.mediaOverlay} />
      <div className={styles.mediaContent}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
          Return to archive
        </Link>
        <div className={styles.mediaCaptionWrap}>
          <p className={styles.mediaEyebrow}>Life Memory — Personal Archive</p>
          <p className={styles.mediaQuote} aria-label={config.line.join(" ")}>
            {config.line.map((line, index) => (
              <motion.span
                key={line}
                aria-hidden="true"
                className="block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.55 + index * 0.07 }}
              >
                {line}
              </motion.span>
            ))}
          </p>
          <p className={styles.mediaSubnote}>{config.subnote}</p>
        </div>
      </div>
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 origin-left bg-canvas motion-reduce:hidden"
      />
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 origin-right bg-canvas motion-reduce:hidden"
      />
    </aside>
  );
}

function AuthTopBar({ indexLabel }: { indexLabel: string }) {
  const { resolvedTheme, mounted, setTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className={styles.topBar}>
      <span className={styles.indexTag}>
        <span className={styles.indexDot} aria-hidden="true" />
        {indexLabel}
      </span>
      <button
        type="button"
        onClick={(event) => setTheme(isDark ? "light" : "dark", event)}
        className={styles.themeToggleBtn}
        aria-label={isDark ? "Switch to Warm Paper light theme" : "Switch to Quiet Night dark theme"}
      >
        {isDark ? (
          <>
            <Sun aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Warm Paper</span>
          </>
        ) : (
          <>
            <Moon aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Quiet Night</span>
          </>
        )}
      </button>
    </div>
  );
}

function AuthShellInner({ variant, children, onDemoRequest }: AuthShellProps) {
  const config = content[variant];

  return (
    <div className={styles.authPage}>
      <EditorialMedia variant={variant} />
      <main className={styles.mainColumn}>
        <AuthTopBar indexLabel={config.indexLabel} />

        <div className={styles.formContainer}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={styles.headerBlock}
          >
            <h1 className={styles.pageTitle}>{config.title}</h1>
            <p className={styles.pageDescription}>{config.description}</p>
          </motion.div>

          {children}

          <p className={styles.switchPrompt}>
            {config.switchText}
            <Link href={config.switchHref} className={styles.switchLink}>
              {config.switchLabel}
            </Link>
          </p>

          <div className={styles.demoSection}>
            <div className={styles.demoCard}>
              <div className={styles.demoMeta}>
                <span className={styles.demoBadge}>✦ Sample Archive</span>
                <p className={styles.demoTitle}>Jimmy&apos;s Demo Vault</p>
                <p className={styles.demoSubtitle}>
                  Explore 48 curated memories without signing in.
                </p>
              </div>
              {variant === "register" || !onDemoRequest ? (
                <Link href="/dashboard?demo=jimmy" className={styles.demoActionBtn}>
                  <span>Open Demo</span>
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <button type="button" onClick={onDemoRequest} className={styles.demoActionBtn}>
                  <span>Open Demo</span>
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <span>Life Memory · Private by Default</span>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>
              Privacy
            </Link>
            <Link href="/terms" className={styles.bottomLink}>
              Terms
            </Link>
            <Link href="/faq" className={styles.bottomLink}>
              FAQ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export function AuthShell(props: AuthShellProps) {
  return (
    <ThemeProvider>
      <AuthShellInner {...props} />
    </ThemeProvider>
  );
}

export function AuthSubmitLabel({
  idle,
  pending,
  isSubmitting,
}: {
  idle: string;
  pending: string;
  isSubmitting: boolean;
}) {
  if (isSubmitting) {
    return (
      <span className="inline-flex items-center gap-2">
        {pending}
        <span aria-hidden="true" className="inline-flex gap-1 motion-reduce:hidden">
          <i className="h-1 w-1 animate-pulse rounded-full bg-current" />
          <i className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
          <i className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
        </span>
      </span>
    );
  }
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-300 group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transform-none motion-reduce:transition-none">
        {idle}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:hidden"
      >
        {idle}
      </span>
    </span>
  );
}

export function AuthStatus({
  message,
  tone,
  actionHref,
  actionLabel,
}: {
  message: string;
  tone: "error" | "success" | "info";
  actionHref?: string;
  actionLabel?: string;
}) {
  const toneClass =
    tone === "error"
      ? styles.statusError
      : tone === "success"
      ? styles.statusSuccess
      : styles.statusInfo;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`${styles.statusBanner} ${toneClass}`}
    >
      <span>{message}</span>
      {actionHref && actionLabel && (
        <Link href={actionHref} className={styles.statusActionLink}>
          <span>{actionLabel}</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export function AuthDivider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className={styles.dividerRow} role="separator" aria-label={label}>
      <span className={styles.dividerLine} aria-hidden="true" />
      <span className={styles.dividerText}>{label}</span>
      <span className={styles.dividerLine} aria-hidden="true" />
    </div>
  );
}

export function GoogleContinueButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={styles.googleBtn}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={styles.googleIcon}
      >
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
        />
      </svg>
      <span>{isLoading ? "Connecting to Google…" : "Continue with Google"}</span>
    </button>
  );
}

async function createGoogleNoncePair(): Promise<{
  rawNonce: string;
  hashedNonce: string;
}> {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  const rawNonce = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const encoded = new TextEncoder().encode(rawNonce);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  const hashedNonce = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
  return { rawNonce, hashedNonce };
}

/**
 * If Google redirected back to /login#id_token=..., exchanges the ID token
 * directly with Supabase (`signInWithIdToken`) and returns the destination path.
 */
export async function completeGoogleIdTokenFromHash(): Promise<{
  handled: boolean;
  redirectTo?: string;
  error?: string;
}> {
  if (typeof window === "undefined" || !window.location.hash) {
    return { handled: false };
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const idToken = hashParams.get("id_token");
  const oauthError = hashParams.get("error_description") || hashParams.get("error");

  if (!idToken && !oauthError) {
    return { handled: false };
  }

  // Clean hash from address bar immediately
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );

  if (oauthError) {
    return { handled: true, error: oauthError };
  }

  const rawNonce = sessionStorage.getItem("lm_google_oauth_nonce") || undefined;
  const savedNext = sessionStorage.getItem("lm_google_oauth_next") || "/dashboard";
  sessionStorage.removeItem("lm_google_oauth_nonce");
  sessionStorage.removeItem("lm_google_oauth_next");

  const supabase = createClient();
  let { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken!,
    nonce: rawNonce,
  });

  // Fallback if "Skip nonce check" is enabled in Supabase
  if (error && rawNonce && /nonce/i.test(error.message)) {
    const retry = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken!,
    });
    error = retry.error;
  }

  if (error) {
    return { handled: true, error: error.message };
  }

  const safeNext =
    savedNext.startsWith("/") && !savedNext.startsWith("//")
      ? savedNext
      : "/dashboard";
  return { handled: true, redirectTo: safeNext };
}

/**
 * Checks whether the Supabase project has Google OAuth enabled before redirecting.
 * When NEXT_PUBLIC_GOOGLE_CLIENT_ID is set, initiates Google OAuth directly from
 * this app's origin so Google's chooser shows "to continue to Life Memory" instead
 * of "<project-ref>.supabase.co".
 */
export async function startGoogleOAuth(redirectPath = "/dashboard"): Promise<{
  ok: boolean;
  providerDisabled?: boolean;
  message?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    "76063746477-poaatnfg20ir5cnmqcnjro53v919dv6b.apps.googleusercontent.com";

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("placeholder.supabase.co")
  ) {
    return {
      ok: false,
      providerDisabled: true,
      message:
        "Google Sign-In is not configured in this environment yet. You can sign in with email & password, or explore Jimmy's sample archive right away.",
    };
  }

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => window.clearTimeout(timer));

    if (settingsRes.ok) {
      const settings = (await settingsRes.json()) as {
        external?: { google?: boolean };
      };
      if (settings?.external?.google === false) {
        return {
          ok: false,
          providerDisabled: true,
          message:
            "Google OAuth is not enabled in the Supabase Auth provider settings yet (Authentication → Providers → Google). Please sign in with email & password, or open Jimmy's Demo Vault below.",
        };
      }
    }
  } catch {
    return {
      ok: false,
      providerDisabled: true,
      message:
        "Google Sign-In could not reach the authentication provider right now. You can sign in with email & password, or open Jimmy's Demo Vault below.",
    };
  }

  try {
    const safeNext =
      redirectPath.startsWith("/") && !redirectPath.startsWith("//")
        ? redirectPath
        : "/dashboard";

    // Direct Google OAuth flow so Google's screen displays "to continue to Life Memory"
    if (
      googleClientId &&
      !googleClientId.includes("your-google-client-id")
    ) {
      const { rawNonce, hashedNonce } = await createGoogleNoncePair();
      sessionStorage.setItem("lm_google_oauth_nonce", rawNonce);
      sessionStorage.setItem("lm_google_oauth_next", safeNext);

      const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      googleAuthUrl.searchParams.set("client_id", googleClientId);
      googleAuthUrl.searchParams.set("redirect_uri", `${window.location.origin}/login`);
      googleAuthUrl.searchParams.set("response_type", "id_token");
      googleAuthUrl.searchParams.set("scope", "openid email profile");
      googleAuthUrl.searchParams.set("nonce", hashedNonce);
      googleAuthUrl.searchParams.set("prompt", "select_account");

      window.location.assign(googleAuthUrl.toString());
      return { ok: true };
    }

    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });
    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      providerDisabled: true,
      message:
        "We could not start Google Sign-In. Please use email & password or explore Jimmy's Demo Vault.",
    };
  }
}
