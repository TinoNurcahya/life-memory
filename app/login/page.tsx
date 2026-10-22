"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, AuthStatus, AuthSubmitLabel } from "@/components/auth/AuthShell";

const inputClass = "min-h-12 w-full rounded-xl border border-hairline bg-surface px-10 text-base text-foreground placeholder:text-faint outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30";

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "auth_callback") {
      setError("We could not complete email confirmation. Please use a fresh confirmation link, then sign in again.");
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setIsSubmitting(true);

    try {
      const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const safeRedirect = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard";
      router.replace(safeRedirect);
    } catch {
      setError("We could not reach the archive. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect || "/dashboard")}` } });
  };

  return <AuthShell variant="login" onDemoRequest={() => router.push("/dashboard?demo=jimmy")}>
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <AuthStatus message={error} tone="error" />}
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-muted">Email address</label>
        <div className="relative">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input ref={emailRef} id="login-email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-muted">Password</label>
        <div className="relative">
          <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-12`} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className="group inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-medium text-canvas transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        <AuthSubmitLabel idle="Sign in to Life Memory" pending="Signing in…" isSubmitting={isSubmitting} />
      </button>
      <button type="button" onClick={handleGoogle} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-strong px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-subdued">Continue with Google</button>
      <p role="status" aria-live="polite" className="sr-only">{isSubmitting ? "Signing in…" : ""}</p>
    </form>
  </AuthShell>;
}
