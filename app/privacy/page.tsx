import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import styles from "@/components/editorial/About.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy · Life Memory",
  description:
    "How Life Memory protects your autobiographical archives. Strict data sovereignty, Google Gemini enterprise privacy, and zero model training commitments.",
};

export default function PrivacyPolicyPage() {
  return (
    <EditorialShell
      badge="Legal & Compliance"
      title="Privacy Policy"
      subtitle="Your memories are sacred. We treat your personal archive with cryptographic tenant isolation, strict row-level security, and a binding zero-training commitment."
      lastUpdated="November 2026"
      wide
    >
      <div className={styles.aboutContainer}>
        {/* Top Telemetry Strip */}
        <div className={styles.metricsStrip} aria-label="Privacy commitments summary">
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>01 · Model Training</span>
            <span className={styles.metricValue}>0% Used</span>
            <span className={styles.metricSub}>Zero foundation model training</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>02 · Tenant Isolation</span>
            <span className={styles.metricValue}>Strict RLS</span>
            <span className={styles.metricSub}>PostgreSQL row-level security</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>03 · Encryption</span>
            <span className={styles.metricValue}>AES-256</span>
            <span className={styles.metricSub}>At rest &amp; TLS 1.3 in transit</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>04 · Data Ownership</span>
            <span className={styles.metricValue}>100% Yours</span>
            <span className={styles.metricSub}>1-click JSON export &amp; erasure</span>
          </div>
        </div>

        {/* ── CHAPTER 01: COLLECTION SCOPE ── */}
        <section className={styles.chapterSection} aria-labelledby="privacy-01-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              01 — Collection Scope
            </span>
            <h2 id="privacy-01-heading" className={styles.chapterTitle}>
              Minimum Necessary Data
            </h2>
            <p className={styles.chapterLead}>
              We collect only what is strictly required to operate your private life archive—never ad-tracking profiles or behavioral telemetry.
            </p>
            <span className={styles.chapterMetaBadge}>Zero Ad Tracking</span>
          </div>

          <div className={styles.contentColumn}>
            <blockquote className={styles.pullQuote}>
              <p className={styles.pullQuoteText}>
                &ldquo;We do not sell your personal data. We do not display advertisements. We do not use your diary entries to train machine learning models.&rdquo;
              </p>
              <footer className={styles.pullQuoteCaption}>
                Plain-English Privacy Guarantee · Life Memory
              </footer>
            </blockquote>

            <div className={styles.proseBlock}>
              <ul className={styles.bulletList}>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>01</span>
                  <span>
                    <strong>Account Credentials:</strong> Your email address and optional display name provided during email registration or Google OAuth sign-in.
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>02</span>
                  <span>
                    <strong>Autobiographical Content:</strong> The raw text entries, dates, notes, and optional photos you explicitly record inside your vault.
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>03</span>
                  <span>
                    <strong>Extracted Entity Structures:</strong> Structured tags derived from your notes (people, places, topics, and first-time milestones), stored exclusively inside your private database partition.
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>04</span>
                  <span>
                    <strong>Authentication Cookies:</strong> Strictly functional, cryptographically signed HTTP-only cookies managed by Supabase to maintain your authenticated session.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 02: AI & GEMINI PROCESSING ── */}
        <section className={styles.chapterSection} aria-labelledby="privacy-02-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              02 — AI Processing
            </span>
            <h2 id="privacy-02-heading" className={styles.chapterTitle}>
              Ephemeral Gemini Charter
            </h2>
            <p className={styles.chapterLead}>
              How your notes are processed by Google Gemini 3.5 &amp; 3.8 Flash APIs without ever being retained by model providers.
            </p>
            <span className={styles.chapterMetaBadge}>Ephemeral Inference</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.charterGrid}>
              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Commitment I</span>
                  <span className={styles.charterCheck}>Binding</span>
                </div>
                <h3 className={styles.charterTitle}>Zero Model Training</h3>
                <p className={styles.charterText}>
                  Under paid enterprise API terms, payloads sent to Google Gemini are never used to train, retrain, fine-tune, or improve foundation models.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Commitment II</span>
                  <span className={styles.charterCheck}>Volatile RAM</span>
                </div>
                <h3 className={styles.charterTitle}>Ephemeral Inference</h3>
                <p className={styles.charterText}>
                  Text payloads are processed in volatile memory only for the duration of the extraction or reflection request and are purged immediately after response generation.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Commitment III</span>
                  <span className={styles.charterCheck}>Verified [1][2]</span>
                </div>
                <h3 className={styles.charterTitle}>Scoped Context Only</h3>
                <p className={styles.charterText}>
                  Ask Memory and Monthly Reflection queries receive only your own authenticated activity records—never cross-tenant data or external web scraping.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Commitment IV</span>
                  <span className={styles.charterCheck}>Full Override</span>
                </div>
                <h3 className={styles.charterTitle}>Human-in-the-Loop Control</h3>
                <p className={styles.charterText}>
                  Every AI-derived category, person, place, or topic tag can be manually edited or removed by you at any time in the Timeline view.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 03: CRYPTOGRAPHIC SECURITY ── */}
        <section className={styles.chapterSection} aria-labelledby="privacy-03-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              03 — Database Security
            </span>
            <h2 id="privacy-03-heading" className={styles.chapterTitle}>
              Row-Level Isolation
            </h2>
            <p className={styles.chapterLead}>
              Database-enforced tenant boundaries ensure no other user or process can ever query your rows.
            </p>
            <span className={styles.chapterMetaBadge}>Supabase PostgreSQL</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.proseBlock}>
              <ul className={styles.bulletList}>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>✓</span>
                  <span>
                    <strong>PostgreSQL Row-Level Security (RLS):</strong> Every table in the Life Memory schema enforces mandatory RLS policies keyed to your cryptographic user ID (<code className={styles.inlineCode}>auth.uid() = user_id</code>).
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>✓</span>
                  <span>
                    <strong>Transport &amp; Storage Encryption:</strong> All network traffic is encrypted via TLS 1.3. Database volumes and backups are encrypted at rest using AES-256 block ciphers.
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>✓</span>
                  <span>
                    <strong>Isolated Demo Sandbox:</strong> When exploring Jimmy&apos;s Demo Vault (<code className={styles.inlineCode}>?demo=jimmy</code>), all interactions run in local browser memory with zero remote database mutations.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 04: GDPR, CCPA & DATA SOVEREIGNTY ── */}
        <section className={styles.chapterSection} aria-labelledby="privacy-04-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              04 — Data Sovereignty
            </span>
            <h2 id="privacy-04-heading" className={styles.chapterTitle}>
              Your Legal &amp; Export Rights
            </h2>
            <p className={styles.chapterLead}>
              Unconditional portability and erasure rights under GDPR, CCPA, and international privacy standards.
            </p>
            <span className={styles.chapterMetaBadge}>GDPR · CCPA</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.dimensionGrid}>
              <Link href="/settings?demo=jimmy" className={styles.dimensionCard}>
                <div>
                  <span className={styles.dimensionIndex}>Right 01 · Portability (FR-11)</span>
                  <h3 className={styles.dimensionHeading}>1-Click Full JSON Export</h3>
                  <p className={styles.dimensionBody}>
                    Download your entire archive across all relational tables (activities, extracted entities, people, places, topics, and reflections) in standard machine-readable JSON at any moment.
                  </p>
                </div>
                <span className={styles.dimensionLinkRow}>
                  <span>Open Settings &amp; Export</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>

              <Link href="/settings?demo=jimmy" className={styles.dimensionCard}>
                <div>
                  <span className={styles.dimensionIndex}>Right 02 · Erasure</span>
                  <h3 className={styles.dimensionHeading}>Permanent Account Purge</h3>
                  <p className={styles.dimensionBody}>
                    You may permanently delete your account and trigger a cascading erasure of all associated memories, entities, and reflections from our PostgreSQL cluster.
                  </p>
                </div>
                <span className={styles.dimensionLinkRow}>
                  <span>Manage Account in Settings</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </div>

            <div className={styles.complianceBar}>
              <p className={styles.complianceText}>
                Privacy &amp; Data Protection Officer inquiries: <code className={styles.inlineCode}>tinonurcahya.ti@gmail.com</code>
              </p>
              <div className={styles.complianceLinks}>
                <Link href="/terms" className={styles.complianceLink}>
                  <span>Terms of Service</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link href="/disclaimer" className={styles.complianceLink}>
                  <span>AI Safety Disclaimer</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link href="/about" className={styles.complianceLink}>
                  <span>Origin &amp; Philosophy</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </EditorialShell>
  );
}
