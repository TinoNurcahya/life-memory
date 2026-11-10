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
  Trash2,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/experience/theme-context";
import { deleteUserAccountAndMemories } from "@/app/actions/activities";
import styles from "./Settings.module.css";

interface SettingsClientProps {
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
    createdAt?: string;
  };
  stats?: {
    activities: number;
    people: number;
    places: number;
    topics: number;
    firstTimes: number;
  };
  isDemo?: boolean;
}

export function SettingsClient({
  user,
  stats = { activities: 48, people: 5, places: 7, topics: 8, firstTimes: 20 },
  isDemo = false,
}: SettingsClientProps) {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const exportUrl = isDemo ? "/api/export?demo=jimmy" : "/api/export";
  const displayName = user.fullName || (isDemo ? "Jimmy" : "Life Memory Archivist");
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (isDemo) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("extra_demo_memories");
        }
        toast.success("Exited demo mode.");
        router.push("/");
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Signed out successfully.");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign out.");
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
    <main className={styles.page} data-settings-page lang="en">
      {/* Editorial Header */}
      <header className={styles.intro}>
        <div className={styles.heading}>
          <h1>Settings &amp; Data</h1>
          <span>
            {stats.activities} {stats.activities === 1 ? "memory" : "memories"} indexed
          </span>
        </div>
        <div className={styles.introBottom}>
          <p>
            Manage your reading environment, export your complete personal life archive, and review data sovereignty commitments.
          </p>
          <div className={styles.leadMeta}>
            <span>Active theme: {resolvedTheme === "dark" ? "Quiet Night" : "Warm Paper"}</span>
            <span>100% portable JSON schema</span>
          </div>
        </div>
      </header>

      <div className={styles.sections}>
        {/* 01 · Account & Session */}
        <section className={styles.sectionRow} aria-labelledby="settings-account">
          <div className={styles.sectionMeta}>
            <span className={styles.sectionIndex}>01 · Identity</span>
            <h2 id="settings-account" className={styles.sectionTitle}>
              Account &amp; Session
            </h2>
            <p className={styles.sectionDesc}>
              Your active archive profile and authentication session boundary.
            </p>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <div className={styles.profileRow}>
                <div className={styles.profileIdentity}>
                  <div className={styles.avatar} aria-hidden="true">
                    {initial}
                  </div>
                  <div className={styles.profileText}>
                    <div className={styles.profileNameRow}>
                      <span className={styles.profileName}>{displayName}</span>
                      <span className={styles.statusPill}>
                        <span className={styles.statusDot} />
                        {isDemo ? "Fictional Demo" : "Private Archive"}
                      </span>
                    </div>
                    <span className={styles.profileEmail}>
                      {user.email || (isDemo ? "jimmy.demo@example.com" : "Authenticated Session")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={styles.secondaryBtn}
                >
                  <LogOut size={14} aria-hidden="true" />
                  <span>
                    {isLoggingOut
                      ? "Signing out..."
                      : isDemo
                        ? "Exit Demo"
                        : "Sign out"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 02 · Appearance & Reading Environment */}
        <section className={styles.sectionRow} aria-labelledby="settings-appearance">
          <div className={styles.sectionMeta}>
            <span className={styles.sectionIndex}>02 · Reading Environment</span>
            <h2 id="settings-appearance" className={styles.sectionTitle}>
              Appearance
            </h2>
            <p className={styles.sectionDesc}>
              Switch between warm archival paper, quiet obsidian night mode, or follow your system preference.
            </p>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.themeGrid}>
              {/* Light Mode */}
              <button
                type="button"
                onClick={(e) => setTheme("light", e)}
                aria-pressed={theme === "light"}
                className={`${styles.themeCard} ${theme === "light" ? styles.themeCardActive : ""}`}
              >
                <div className={`${styles.swatch} ${styles.swatchLight}`} aria-hidden="true">
                  <div className={styles.swatchHeader}>
                    <span className={styles.swatchTag}>#F8F6F1</span>
                    <span className={styles.swatchIconBadge}>
                      <Sun size={14} />
                    </span>
                  </div>
                  <div className={styles.swatchLines}>
                    <span className={styles.swatchLineShort} />
                    <span className={styles.swatchLine} />
                  </div>
                </div>
                <div className={styles.themeHeader}>
                  <span className={styles.themeName}>Light</span>
                  {theme === "light" && <span className={styles.themeActiveBadge}>Active</span>}
                </div>
                <span className={styles.themeDesc}>Warm archival paper</span>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={(e) => setTheme("dark", e)}
                aria-pressed={theme === "dark"}
                className={`${styles.themeCard} ${theme === "dark" ? styles.themeCardActive : ""}`}
              >
                <div className={`${styles.swatch} ${styles.swatchDark}`} aria-hidden="true">
                  <div className={styles.swatchHeader}>
                    <span className={styles.swatchTag}>#161615</span>
                    <span className={styles.swatchIconBadge}>
                      <Moon size={14} />
                    </span>
                  </div>
                  <div className={styles.swatchLines}>
                    <span className={styles.swatchLineShort} />
                    <span className={styles.swatchLine} />
                  </div>
                </div>
                <div className={styles.themeHeader}>
                  <span className={styles.themeName}>Dark</span>
                  {theme === "dark" && <span className={styles.themeActiveBadge}>Active</span>}
                </div>
                <span className={styles.themeDesc}>Quiet obsidian night</span>
              </button>

              {/* System Mode */}
              <button
                type="button"
                onClick={(e) => setTheme("system", e)}
                aria-pressed={theme === "system"}
                className={`${styles.themeCard} ${theme === "system" ? styles.themeCardActive : ""}`}
              >
                <div className={`${styles.swatch} ${styles.swatchSystem}`} aria-hidden="true">
                  <div className={styles.swatchSystemBar}>
                    <span className={styles.swatchSystemLeft}>Paper</span>
                    <span className={`${styles.swatchIconBadge} ${styles.swatchSystemRight}`}>
                      <Laptop size={13} />
                    </span>
                  </div>
                  <div className={styles.swatchSystemBar}>
                    <span className={styles.swatchSystemLeft}>Auto</span>
                    <span className={styles.swatchSystemRight}>Night</span>
                  </div>
                </div>
                <div className={styles.themeHeader}>
                  <span className={styles.themeName}>System</span>
                  {theme === "system" && <span className={styles.themeActiveBadge}>Active</span>}
                </div>
                <span className={styles.themeDesc}>Follow device appearance</span>
              </button>
            </div>
          </div>
        </section>

        {/* 03 · Data Sovereignty & Archive Export */}
        <section className={styles.sectionRow} aria-labelledby="settings-export">
          <div className={styles.sectionMeta}>
            <span className={styles.sectionIndex}>03 · Data Sovereignty</span>
            <h2 id="settings-export" className={styles.sectionTitle}>
              Export Your Archive
            </h2>
            <p className={styles.sectionDesc}>
              You own 100% of your memories. Export your entire relational archive at any time as a clean, portable JSON document.
            </p>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <div className={styles.inventoryStrip} aria-label="Archive inventory summary">
                <div className={styles.inventoryItem}>
                  <span className={styles.inventoryValue}>{stats.activities}</span>
                  <span className={styles.inventoryLabel}>Memories</span>
                </div>
                <div className={styles.inventoryItem}>
                  <span className={styles.inventoryValue}>{stats.people}</span>
                  <span className={styles.inventoryLabel}>People</span>
                </div>
                <div className={styles.inventoryItem}>
                  <span className={styles.inventoryValue}>{stats.places}</span>
                  <span className={styles.inventoryLabel}>Places</span>
                </div>
                <div className={styles.inventoryItem}>
                  <span className={styles.inventoryValue}>{stats.topics}</span>
                  <span className={styles.inventoryLabel}>Topics</span>
                </div>
                <div className={styles.inventoryItem}>
                  <span className={styles.inventoryValue}>{stats.firstTimes}</span>
                  <span className={styles.inventoryLabel}>First Times</span>
                </div>
              </div>

              <div className={styles.exportRow}>
                <div className={styles.exportMeta}>
                  <span className={styles.exportTitle}>Complete Relational Snapshot (JSON v1.0)</span>
                  <span className={styles.exportSub}>
                    Includes raw entries, atomic details, people, places, topics, and cited insights.
                  </span>
                </div>

                <a href={exportUrl} download className={styles.primaryBtn}>
                  <Download size={15} aria-hidden="true" />
                  <span>Download Full Archive (JSON)</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 04 · Privacy & AI Commitments */}
        <section className={styles.sectionRow} aria-labelledby="settings-privacy">
          <div className={styles.sectionMeta}>
            <span className={styles.sectionIndex}>04 · Architecture Guarantees</span>
            <h2 id="settings-privacy" className={styles.sectionTitle}>
              Privacy &amp; AI Commitments
            </h2>
            <p className={styles.sectionDesc}>
              How your personal notes are isolated in storage and processed during language extraction.
            </p>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.card}>
              <div className={styles.commitmentList}>
                <div className={styles.commitmentItem}>
                  <span className={styles.commitmentHead}>
                    <CheckCircle2 size={14} aria-hidden="true" /> Zero Model Training
                  </span>
                  <p className={styles.commitmentBody}>
                    Your personal notes and extracted memories are never used to train or fine-tune external foundation models.
                  </p>
                </div>

                <div className={styles.commitmentItem}>
                  <span className={styles.commitmentHead}>
                    <ShieldCheck size={14} aria-hidden="true" /> Ephemeral Inference
                  </span>
                  <p className={styles.commitmentBody}>
                    Payloads sent to Gemini are held strictly for the duration of structured extraction or reflection synthesis.
                  </p>
                </div>

                <div className={styles.commitmentItem}>
                  <span className={styles.commitmentHead}>
                    <CheckCircle2 size={14} aria-hidden="true" /> Row-Level Isolation
                  </span>
                  <p className={styles.commitmentBody}>
                    Every database table and reactive view enforces strict per-user PostgreSQL Row Level Security policies.
                  </p>
                </div>
              </div>

              <div className={styles.legalLinks}>
                <span className={styles.legalLabel}>Documentation &amp; Policies</span>
                <nav className={styles.legalNav} aria-label="Policies and documentation">
                  <Link href="/privacy" className={styles.legalLink}>
                    Privacy Policy <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                  <Link href="/terms" className={styles.legalLink}>
                    Terms of Service <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                  <Link href="/faq" className={styles.legalLink}>
                    FAQ <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                  <Link href="/disclaimer" className={styles.legalLink}>
                    Safety Disclaimer <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                  <Link href="/sitemap" className={styles.legalLink}>
                    Sitemap <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* 05 · Danger Zone */}
        <section className={styles.sectionRow} aria-labelledby="settings-danger">
          <div className={styles.sectionMeta}>
            <span className={styles.sectionIndex}>05 · Irreversible Action</span>
            <h2 id="settings-danger" className={styles.sectionTitle}>
              Delete Archive
            </h2>
            <p className={styles.sectionDesc}>
              Permanently purge your account and all recorded memories from the database.
            </p>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.dangerCard}>
              <div className={styles.dangerInfo}>
                <span className={styles.dangerTitle}>
                  <AlertTriangle size={15} aria-hidden="true" /> Delete Account &amp; All Memories
                </span>
                <p className={styles.dangerDesc}>
                  Permanently removes your profile, activity logs, constellations, and generated reflections. This action cannot be undone.
                </p>
              </div>

              {isDemo ? (
                <span className={styles.statusPill}>Disabled in demo mode</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className={styles.dangerBtn}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  <span>Delete Archive &amp; Account</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Double-Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className={styles.modalCard}>
            <h3 id="delete-modal-title" className={styles.modalTitle}>
              <AlertTriangle size={20} aria-hidden="true" /> Delete your entire archive?
            </h3>
            <p className={styles.modalDesc}>
              This will permanently delete your account and all associated memories, people, places, topics, and reflections.
            </p>

            <div className={styles.modalField}>
              <label htmlFor="confirm-delete" className={styles.modalLabel}>
                Type <strong>DELETE</strong> below to confirm:
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className={styles.modalInput}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmInput("");
                }}
                disabled={isDeleting}
                className={styles.secondaryBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmInput !== "DELETE" || isDeleting}
                className={styles.dangerBtn}
              >
                <Trash2 size={14} aria-hidden="true" />
                <span>{isDeleting ? "Deleting..." : "Confirm Deletion"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
