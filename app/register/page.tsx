"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AuthDivider,
  AuthShell,
  AuthStatus,
  AuthSubmitLabel,
  GoogleContinueButton,
  startGoogleOAuth,
} from "@/components/auth/AuthShell";
import styles from "@/components/auth/Auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [oauthNotice, setOauthNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setSuccess("");
    setOauthNotice("");
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
      setSuccess(
        "Account created. Check your inbox to confirm your address, then sign in."
      );
    } catch {
      setError("We could not create the archive. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (isGoogleLoading || isSubmitting) return;
    setError("");
    setSuccess("");
    setOauthNotice("");
    setIsGoogleLoading(true);
    try {
      const result = await startGoogleOAuth("/dashboard");
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
    <AuthShell variant="register">
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {error && <AuthStatus message={error} tone="error" />}
        {success && <AuthStatus message={success} tone="success" />}
        {oauthNotice && (
          <AuthStatus
            message={oauthNotice}
            tone="info"
            actionHref="/dashboard?demo=jimmy"
            actionLabel="Open Jimmy's Demo Vault"
          />
        )}

        <div className={styles.fieldGroup}>
          <label htmlFor="register-name" className={styles.fieldLabel}>
            <span>Your name</span>
          </label>
          <div className={styles.inputWrapper}>
            <User aria-hidden="true" className={styles.inputIcon} />
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Jimmy"
              className={styles.textInput}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="register-email" className={styles.fieldLabel}>
            <span>Email address</span>
          </label>
          <div className={styles.inputWrapper}>
            <Mail aria-hidden="true" className={styles.inputIcon} />
            <input
              id="register-email"
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
          <label htmlFor="register-password" className={styles.fieldLabel}>
            <span>Password</span>
            <span className={styles.fieldHint}>6 characters minimum</span>
          </label>
          <div className={styles.inputWrapper}>
            <Lock aria-hidden="true" className={styles.inputIcon} />
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
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
            idle="Create account & start archive"
            pending="Creating account…"
            isSubmitting={isSubmitting}
          />
        </button>

        <AuthDivider />

        <GoogleContinueButton
          onClick={handleGoogle}
          isLoading={isGoogleLoading}
        />

        <p role="status" aria-live="polite" className="sr-only">
          {isSubmitting ? "Creating account…" : ""}
        </p>
      </form>
    </AuthShell>
  );
}
