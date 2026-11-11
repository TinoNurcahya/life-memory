"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AuthDivider,
  AuthShell,
  AuthStatus,
  AuthSubmitLabel,
  GoogleContinueButton,
  completeGoogleIdTokenFromHash,
  startGoogleOAuth,
} from "@/components/auth/AuthShell";
import styles from "@/components/auth/Auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [oauthNotice, setOauthNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorDescription = params.get("error_description");
    if (errorDescription) {
      setError(errorDescription);
    } else if (params.get("error") === "auth_callback") {
      setError(
        "We could not complete authentication. Please use a fresh confirmation link or sign in with email and password."
      );
    }

    if (window.location.hash.includes("id_token") || window.location.hash.includes("error")) {
      setIsGoogleLoading(true);
      void completeGoogleIdTokenFromHash()
        .then((res) => {
          if (res.handled) {
            if (res.error) {
              setError(res.error);
            } else if (res.redirectTo) {
              router.replace(res.redirectTo);
              return;
            }
          }
          setIsGoogleLoading(false);
        })
        .catch(() => {
          setError("Could not complete Google Sign-In. Please try again.");
          setIsGoogleLoading(false);
        });
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setOauthNotice("");
    setIsSubmitting(true);

    try {
      const { error: signInError } = await createClient().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      const safeRedirect =
        redirect?.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : "/dashboard";
      router.replace(safeRedirect);
    } catch {
      setError("We could not reach the archive. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (isGoogleLoading || isSubmitting) return;
    setError("");
    setOauthNotice("");
    setIsGoogleLoading(true);
    try {
      const redirect =
        new URLSearchParams(window.location.search).get("redirect") ||
        "/dashboard";
      const result = await startGoogleOAuth(redirect);
      if (!result.ok) {
        if (result.providerDisabled) {
          setOauthNotice(
            result.message ||
              "Google Sign-In is not enabled in Supabase Auth yet."
          );
        } else {
          setError(
            result.message ||
              "Could not sign in with Google. Please try email & password."
          );
        }
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      variant="login"
      onDemoRequest={() => router.push("/dashboard?demo=jimmy")}
    >
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {error && <AuthStatus message={error} tone="error" />}
        {oauthNotice && (
          <AuthStatus
            message={oauthNotice}
            tone="info"
            actionHref="/dashboard?demo=jimmy"
            actionLabel="Open Jimmy's Demo Vault"
          />
        )}

        <div className={styles.fieldGroup}>
          <label htmlFor="login-email" className={styles.fieldLabel}>
            <span>Email address</span>
          </label>
          <div className={styles.inputWrapper}>
            <Mail aria-hidden="true" className={styles.inputIcon} />
            <input
              ref={emailRef}
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className={styles.textInput}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="login-password" className={styles.fieldLabel}>
            <span>Password</span>
          </label>
          <div className={styles.inputWrapper}>
            <Lock aria-hidden="true" className={styles.inputIcon} />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className={`${styles.textInput} ${styles.passwordInput}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className={styles.visibilityBtn}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Eye aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className={`group ${styles.primarySubmitBtn}`}
        >
          <AuthSubmitLabel
            idle="Sign in to Life Memory"
            pending="Signing in…"
            isSubmitting={isSubmitting}
          />
        </button>

        <AuthDivider />

        <GoogleContinueButton
          onClick={handleGoogle}
          isLoading={isGoogleLoading}
        />

        <p role="status" aria-live="polite" className="sr-only">
          {isSubmitting ? "Signing in…" : ""}
        </p>
      </form>
    </AuthShell>
  );
}
