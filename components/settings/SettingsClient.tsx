"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Laptop,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  User,
  Database,
  Trash2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/experience/theme-context";
import { deleteUserAccountAndMemories } from "@/app/actions/activities";

interface SettingsClientProps {
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
    createdAt?: string;
  };
  isDemo?: boolean;
}

export function SettingsClient({ user, isDemo = false }: SettingsClientProps) {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const exportUrl = isDemo ? "/api/export?demo=jimmy" : "/api/export";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (isDemo) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("extra_demo_memories");
        }
        toast.success("Keluar dari mode demo.");
        router.push("/");
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Berhasil keluar dari akun.");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirmInput !== "DELETE") {
      toast.error("Please type DELETE exactly to confirm.");
      return;
    }

    startDeleteTransition(async () => {
      try {
        const res = await deleteUserAccountAndMemories("DELETE");
        if (res.success) {
          toast.success("Account and memories deleted permanently.");
          setShowDeleteModal(false);
          router.push("/");
        } else {
          toast.error(res.error || "Failed to delete account.");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error deleting account.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Page Header */}
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          Configuration & Data Sovereignty · S-15
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted">
          Manage your interface appearance, export your full personal life archive, and review privacy commitments.
        </p>
      </header>

      <div className="space-y-8">
        {/* 1. Account Profile Card */}
        <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-hairline bg-surface-subdued text-brand">
                <User className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-medium text-foreground">
                    {user.fullName || (isDemo ? "Jimmy (Demo)" : "Life Memory Archivist")}
                  </h2>
                  <span className="rounded-full bg-surface-subdued px-2.5 py-0.5 font-mono text-[10px] text-muted">
                    {isDemo ? "Demo User" : "Private Cloud"}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {user.email || (isDemo ? "jimmy.demo@example.com" : "Signed-in User")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface-subdued/80 px-4 py-2 font-mono text-xs text-muted transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 self-start sm:self-auto disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isLoggingOut ? "Keluar..." : isDemo ? "Keluar Demo" : "Log out"}</span>
            </button>
          </div>
        </section>

        {/* 2. Appearance & Theme (Light / Dark / System) */}
        <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-8 shadow-xs">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted">Interface Theme · FR-12</p>
              <h2 className="mt-1 font-serif text-xl font-medium text-foreground">Appearance</h2>
              <p className="mt-1 text-xs text-muted">
                Choose between warm linen light mode, deep obsidian dark mode, or follow your operating system.
              </p>
            </div>
            <span className="hidden font-mono text-[11px] text-muted sm:inline">
              Active: <strong className="capitalize text-foreground">{resolvedTheme}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                theme === "light"
                  ? "border-brand bg-brand/5 shadow-xs"
                  : "border-hairline bg-surface-subdued/40 hover:border-brand/40"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Sun className="h-5 w-5 text-amber-600" />
                {theme === "light" && <CheckCircle2 className="h-4 w-4 text-brand" />}
              </div>
              <span className="mt-3 font-serif text-base font-medium text-foreground">Light</span>
              <span className="mt-0.5 text-xs text-muted">Warm alabaster paper</span>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                theme === "dark"
                  ? "border-brand bg-brand/5 shadow-xs"
                  : "border-hairline bg-surface-subdued/40 hover:border-brand/40"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Moon className="h-5 w-5 text-indigo-400" />
                {theme === "dark" && <CheckCircle2 className="h-4 w-4 text-brand" />}
              </div>
              <span className="mt-3 font-serif text-base font-medium text-foreground">Dark</span>
              <span className="mt-0.5 text-xs text-muted">Deep obsidian luxury</span>
            </button>

            {/* System Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                theme === "system"
                  ? "border-brand bg-brand/5 shadow-xs"
                  : "border-hairline bg-surface-subdued/40 hover:border-brand/40"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Laptop className="h-5 w-5 text-muted" />
                {theme === "system" && <CheckCircle2 className="h-4 w-4 text-brand" />}
              </div>
              <span className="mt-3 font-serif text-base font-medium text-foreground">System</span>
              <span className="mt-0.5 text-xs text-muted">Follow OS preference</span>
            </button>
          </div>
        </section>

        {/* 3. Data Portability (FR-11) */}
        <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-8 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted">
                <Database className="h-3.5 w-3.5 text-brand" /> Data Sovereignty · FR-11
              </div>
              <h2 className="mt-1 font-serif text-xl font-medium text-foreground">Export Your Complete Archive</h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                Download a clean, structured JSON file containing all 10 relational layers: raw notes, extracted memory details, people, places, topics, junctions, and AI insights. You own 100% of your data.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={exportUrl}
              download
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-mono text-xs font-medium text-white transition hover:bg-primary-hover shadow-xs"
            >
              <Download className="h-4 w-4" />
              Download Full Archive (JSON)
            </a>

            <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
              <span className="rounded-md border border-hairline bg-surface-subdued px-2 py-1">
                JSON v1.0.0
              </span>
              <span>10 Tables Covered</span>
            </div>
          </div>
        </section>

        {/* 4. Privacy & Gemini AI Processing Policy */}
        <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-8 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">Privacy & AI Model Commitments</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Life Memory processes unstructured personal diary entries through Google Gemini 3.5 Flash-Lite (entity extraction) and Gemini 3.8 Flash (monthly reflections). Under the Google Cloud API terms of service:
              </p>

              <ul className="mt-3 space-y-2 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span><strong>Zero Model Training:</strong> Your raw diary text is never used to train or fine-tune Google foundation models.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span><strong>Ephemeral Processing:</strong> Extraction payloads are held in memory strictly for the duration of inference, then discarded.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span><strong>Age Eligibility:</strong> Life Memory is strictly designed for individuals 18 years and older.</span>
                </li>
              </ul>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-hairline/60 pt-3 text-xs font-mono text-muted">
                <Link href="/privacy" className="hover:text-foreground transition underline">Privacy Policy</Link>
                <span>·</span>
                <Link href="/terms" className="hover:text-foreground transition underline">Terms of Service</Link>
                <span>·</span>
                <Link href="/faq" className="hover:text-foreground transition underline">FAQ</Link>
                <span>·</span>
                <Link href="/disclaimer" className="hover:text-foreground transition underline">Safety Disclaimer</Link>
                <span>·</span>
                <Link href="/sitemap" className="hover:text-foreground transition underline">User Sitemap</Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Danger Zone */}
        <section className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Danger Zone
              </div>
              <h2 className="mt-1 font-serif text-xl font-medium text-rose-950 dark:text-rose-200">
                Delete Account & All Memories
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-rose-800/80 dark:text-rose-300/80">
                Permanently purge your account, profiles, raw activity logs, entity catalogs, and insights. This action is irreversible.
              </p>
            </div>

            {isDemo ? (
              <span className="shrink-0 rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[10px] text-muted">
                Disabled in demo
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="shrink-0 rounded-xl border border-rose-500/30 bg-rose-600 px-4 py-2 font-mono text-xs font-medium text-white transition hover:bg-rose-700"
              >
                Delete Account
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Double-Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-surface p-6 shadow-2xl sm:p-8">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-serif text-2xl font-medium">Are you absolutely sure?</h3>
            </div>
            <p className="mt-3 text-sm text-muted">
              This will permanently delete your account and all associated activities, people, places, topics, and reflection insights.
            </p>

            <div className="mt-5">
              <label htmlFor="confirm-delete" className="block font-mono text-xs text-muted">
                Type <strong>DELETE</strong> below to confirm:
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="mt-2 w-full rounded-xl border border-hairline bg-surface-subdued px-3 py-2 font-mono text-sm uppercase text-foreground focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmInput("");
                }}
                disabled={isDeleting}
                className="rounded-xl border border-hairline bg-surface px-4 py-2 font-mono text-xs text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmInput !== "DELETE" || isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 font-mono text-xs font-medium text-white transition hover:bg-rose-700 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting…" : "Confirm Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
