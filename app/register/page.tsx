"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, AuthStatus, AuthSubmitLabel } from "@/components/auth/AuthShell";

const inputClass = "min-h-12 w-full rounded-xl border border-hairline bg-surface px-10 text-base text-foreground placeholder:text-faint outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30";

export default function RegisterPage() {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const { data, error: signUpError } = await createClient().auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/login`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        router.replace("/dashboard");
        return;
      }
      setSuccess("Account created. Check your inbox to confirm your address, then sign in.");
    } catch {
      setError("We could not create the archive. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
  };

  return <AuthShell variant="register">
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <AuthStatus message={error} tone="error" />}
      {success && <AuthStatus message={success} tone="success" />}
      <div>
        <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-muted">Your name</label>
        <div className="relative">
          <User aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input id="register-name" name="name" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jimmy" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-muted">Email address</label>
        <div className="relative">
          <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input id="register-email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-muted">Password <span className="font-normal text-faint">(6 characters minimum)</span></label>
        <div className="relative">
          <Lock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-12`} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className="group inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-medium text-canvas transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        <AuthSubmitLabel idle="Create account & start archive" pending="Creating account…" isSubmitting={isSubmitting} />
      </button>
      <button type="button" onClick={handleGoogle} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-strong px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-subdued">Continue with Google</button>
      <p role="status" aria-live="polite" className="sr-only">{isSubmitting ? "Creating account…" : ""}</p>
    </form>
  </AuthShell>;
}
