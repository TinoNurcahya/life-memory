import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import styles from "@/components/editorial/About.module.css";

export const metadata: Metadata = {
  title: "Terms of Service · Life Memory",
  description:
    "Terms of Service governing the use of Life Memory. 100% user copyright retention, ethical personal archiving, and service responsibilities.",
};

export default function TermsOfServicePage() {
  return (
    <EditorialShell
      badge="Terms & Governance"
      title="Terms of Service"
      subtitle="Clear, fair, and transparent terms governing your personal archive. Software terms should be readable by humans and built around unconditional user ownership."
      lastUpdated="November 2026"
      wide
    >
      <div className={styles.aboutContainer}>
        {/* Top Telemetry Strip */}
        <div className={styles.metricsStrip} aria-label="Terms of Service summary">
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>01 · Copyright</span>
            <span className={styles.metricValue}>100% Yours</span>
            <span className={styles.metricSub}>You own every word you write</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>02 · License Scope</span>
            <span className={styles.metricValue}>Revocable</span>
            <span className={styles.metricSub}>Strictly to operate your vault</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>03 · Lock-In</span>
            <span className={styles.metricValue}>Zero</span>
            <span className={styles.metricSub}>Export JSON or leave anytime</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>04 · Monetization</span>
            <span className={styles.metricValue}>No Ads</span>
            <span className={styles.metricSub}>Never sold to third parties</span>
          </div>
        </div>

        {/* ── CHAPTER 01: ACCEPTANCE & OWNERSHIP ── */}
        <section className={styles.chapterSection} aria-labelledby="terms-01-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              01 — Fundamental Rule
            </span>
            <h2 id="terms-01-heading" className={styles.chapterTitle}>
              Acceptance &amp; Ownership
            </h2>
            <p className={styles.chapterLead}>
              Your memories belong exclusively to you. We claim zero proprietary interest in your autobiographical writing.
            </p>
            <span className={styles.chapterMetaBadge}>100% Author Copyright</span>
          </div>

          <div className={styles.contentColumn}>
            <blockquote className={styles.pullQuote}>
              <p className={styles.pullQuoteText}>
                &ldquo;Your memories belong to you. We do not claim any copyright, trademark, or proprietary right over any journal entry, relationship mention, photo, or reflection you commit to Life Memory.&rdquo;
              </p>
              <footer className={styles.pullQuoteCaption}>
                Section 1 · Intellectual Property Guarantee
              </footer>
            </blockquote>

            <div className={styles.proseBlock}>
              <p className={styles.proseParagraph}>
                By accessing or creating an account on <strong>Life Memory</strong> (&ldquo;the Service&rdquo;), you enter into a binding agreement governed by these Terms of Service. To create a private cloud archive, you must be at least 18 years of age or have the consent of a parent or legal guardian.
              </p>
              <p className={styles.proseParagraph}>
                You retain full, unrestricted intellectual property rights over all content you log, upload, or generate within Life Memory.
              </p>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 02: OPERATIONAL LICENSE ── */}
        <section className={styles.chapterSection} aria-labelledby="terms-02-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              02 — Service License
            </span>
            <h2 id="terms-02-heading" className={styles.chapterTitle}>
              How We Operate Your Vault
            </h2>
            <p className={styles.chapterLead}>
              The narrow, revocable technical permissions required to encrypt, index, and render your private archive.
            </p>
            <span className={styles.chapterMetaBadge}>Strictly Scoped</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.proseBlock}>
              <p className={styles.proseParagraph}>
                Solely to enable us to host and run the Service on your behalf, you grant Life Memory a limited, revocable, non-exclusive license to:
              </p>
              <ul className={styles.bulletList}>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>01</span>
                  <span>
                    <strong>Encrypt &amp; Persist:</strong> Store and index your activity records inside your isolated Supabase PostgreSQL partition.
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>02</span>
                  <span>
                    <strong>Ephemeral AI Extraction:</strong> Transmit your raw note text to enterprise Google Gemini API endpoints strictly to extract structured entities (people, places, topics) and render grounded reflections for your private view.
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>03</span>
                  <span>
                    <strong>Immediate Revocation:</strong> This operational license terminates automatically the moment you delete an entry or close your account.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 03: ACCEPTABLE USE & AI BOUNDARIES ── */}
        <section className={styles.chapterSection} aria-labelledby="terms-03-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              03 — Acceptable Use
            </span>
            <h2 id="terms-03-heading" className={styles.chapterTitle}>
              Sanctuary Integrity &amp; AI Scope
            </h2>
            <p className={styles.chapterLead}>
              Protecting platform security and clarifying the non-clinical nature of AI-generated reflections.
            </p>
            <span className={styles.chapterMetaBadge}>Platform Governance</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.charterGrid}>
              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Rule I · Security</span>
                  <span className={styles.charterCheck}>Mandatory</span>
                </div>
                <h3 className={styles.charterTitle}>No Tenant Intrusion</h3>
                <p className={styles.charterText}>
                  You agree not to probe, bypass, or exploit PostgreSQL Row-Level Security policies, authentication endpoints, or API rate limits.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Rule II · Automation</span>
                  <span className={styles.charterCheck}>Protected</span>
                </div>
                <h3 className={styles.charterTitle}>No Abusive Payloads</h3>
                <p className={styles.charterText}>
                  You agree not to use automated scripts to flood extraction or chat endpoints with denial-of-service payloads or unlawful content.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Rule III · Introspection</span>
                  <span className={styles.charterCheck}>Non-Clinical</span>
                </div>
                <h3 className={styles.charterTitle}>Retrospective Aid Only</h3>
                <p className={styles.charterText}>
                  AI-generated pattern insights, S-14 reveals, and monthly reflections are computational aids for personal nostalgia—not medical, psychological, or legal advice.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Rule IV · Continuity</span>
                  <span className={styles.charterCheck}>Best Effort</span>
                </div>
                <h3 className={styles.charterTitle}>Regular JSON Backups</h3>
                <p className={styles.charterText}>
                  While we maintain automated cloud backups, we encourage exporting periodic JSON snapshots of your archive from Settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 04: PORTABILITY, TERMINATION & CONTACT ── */}
        <section className={styles.chapterSection} aria-labelledby="terms-04-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              04 — Account Lifecycle
            </span>
            <h2 id="terms-04-heading" className={styles.chapterTitle}>
              Portability &amp; Termination
            </h2>
            <p className={styles.chapterLead}>
              You are free to export your data or leave Life Memory at any time without friction.
            </p>
            <span className={styles.chapterMetaBadge}>Zero Lock-In</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.proseBlock}>
              <p className={styles.proseParagraph}>
                You may export your complete relational archive in standard JSON format or terminate your account at any time via <Link href="/settings?demo=jimmy" className={styles.routeLinkPrimary}>Settings &amp; Data</Link>. Upon account deletion, all activities, entity graphs, and reflections are permanently purged from our active database.
              </p>
            </div>

            <div className={styles.complianceBar}>
              <p className={styles.complianceText}>
                Legal &amp; Terms inquiries: <code className={styles.inlineCode}>tinonurcahya.ti@gmail.com</code>
              </p>
              <div className={styles.complianceLinks}>
                <Link href="/privacy" className={styles.complianceLink}>
                  <span>Privacy Policy</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link href="/disclaimer" className={styles.complianceLink}>
                  <span>AI Safety Disclaimer</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link href="/settings?demo=jimmy" className={styles.complianceLink}>
                  <span>Settings &amp; Export</span>
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
