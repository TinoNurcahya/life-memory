import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import styles from "@/components/editorial/About.module.css";

export const metadata: Metadata = {
  title: "AI Safety & Medical Disclaimer · Life Memory",
  description:
    "Important safety notice and disclaimer. Life Memory is a reflective autobiographical journaling tool, not a provider of medical, psychological, or psychiatric advice.",
};

export default function DisclaimerPage() {
  return (
    <EditorialShell
      badge="Safety & Medical Notice"
      title="AI Safety &amp; Disclaimer"
      subtitle="Life Memory is designed as a quiet sanctuary for self-reflection and autobiographical continuity. Please review the scope, grounding boundaries, and non-clinical nature of the application."
      lastUpdated="November 2026"
      wide
    >
      <div className={styles.aboutContainer}>
        {/* Top Telemetry Strip */}
        <div className={styles.metricsStrip} aria-label="AI safety and scope summary">
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>01 · Primary Purpose</span>
            <span className={styles.metricValue}>Reflection</span>
            <span className={styles.metricSub}>Autobiographical memory recall</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>02 · Clinical Status</span>
            <span className={styles.metricValue}>Non-Medical</span>
            <span className={styles.metricSub}>Not therapy or clinical care</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>03 · Citation Guard</span>
            <span className={styles.metricValue}>Deterministic</span>
            <span className={styles.metricSub}>Grounded footnote verification</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>04 · Editorial Control</span>
            <span className={styles.metricValue}>100% Human</span>
            <span className={styles.metricSub}>Full manual override in Timeline</span>
          </div>
        </div>

        {/* ── CHAPTER 01: HEALTHCARE & MENTAL HEALTH NOTICE ── */}
        <section className={styles.chapterSection} aria-labelledby="disclaimer-01-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              01 — Healthcare Notice
            </span>
            <h2 id="disclaimer-01-heading" className={styles.chapterTitle}>
              Non-Clinical Boundaries
            </h2>
            <p className={styles.chapterLead}>
              Why computational reflections and conversational recall must never replace licensed medical or psychological care.
            </p>
            <span className={styles.chapterMetaBadge}>Important Notice</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.noticeBanner}>
              <span className={styles.noticeEyebrow}>
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Important Healthcare Notice</span>
              </span>
              <p className={styles.noticeText}>
                Life Memory is <strong>not</strong> a medical device, mental health clinic, or crisis intervention service. Its AI extraction pipelines, Monthly Reflection essays, and <strong>Ask Memory</strong> assistant are built strictly for personal retrospection and memory organization. They do not constitute licensed psychiatric, psychological, clinical, legal, or financial counsel.
              </p>
            </div>

            <div className={styles.proseBlock}>
              <ul className={styles.bulletList}>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>01</span>
                  <span>
                    <strong>No Clinical Diagnosis:</strong> The Service cannot diagnose, treat, prevent, or cure any mental or physical condition, mood disorder, anxiety, depression, or trauma.
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>02</span>
                  <span>
                    <strong>Professional Care First:</strong> Never disregard professional medical or psychological advice—or delay seeking qualified care—because of a pattern or reflection surfaced by Life Memory.
                  </span>
                </li>
                <li className={styles.bulletItem}>
                  <span className={styles.bulletMarker}>03</span>
                  <span>
                    <strong>Emergency Helplines:</strong> If you are experiencing a mental health crisis or severe emotional distress, please contact local emergency services immediately (e.g., dial <strong>988</strong> in the US/Canada, <strong>111</strong> in the UK, <strong>119</strong> in Indonesia, or your local emergency number).
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 02: AI GROUNDING & LIMITATIONS ── */}
        <section className={styles.chapterSection} aria-labelledby="disclaimer-02-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              02 — Epistemic Grounding
            </span>
            <h2 id="disclaimer-02-heading" className={styles.chapterTitle}>
              AI Verification &amp; Limits
            </h2>
            <p className={styles.chapterLead}>
              How our citation validators guard against hallucination, and where human review remains essential.
            </p>
            <span className={styles.chapterMetaBadge}>Human-in-the-Loop</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.charterGrid}>
              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Safeguard I · Citations</span>
                  <span className={styles.charterCheck}>Enforced [1][2]</span>
                </div>
                <h3 className={styles.charterTitle}>Footnote Validation</h3>
                <p className={styles.charterText}>
                  Every Monthly Reflection paragraph must cite verifiable atomic notes (`[1]..[N]`). Uncited claims are automatically stripped by our deterministic validator.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Safeguard II · Ambiguity</span>
                  <span className={styles.charterCheck}>Passive Badge</span>
                </div>
                <h3 className={styles.charterTitle}>Entity Disambiguation</h3>
                <p className={styles.charterText}>
                  Casual nicknames, shorthand, or homonyms may occasionally be misclassified; low-confidence extractions are flagged with a subtle review badge.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Safeguard III · Context</span>
                  <span className={styles.charterCheck}>Logged Only</span>
                </div>
                <h3 className={styles.charterTitle}>Incomplete Sampling</h3>
                <p className={styles.charterText}>
                  Patterns and frequency counts reflect only the moments you chose to write down, not the entirety of your unrecorded days.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Safeguard IV · Authority</span>
                  <span className={styles.charterCheck}>100% Editable</span>
                </div>
                <h3 className={styles.charterTitle}>Timeline Override</h3>
                <p className={styles.charterText}>
                  You are the sole authority on your life story. Every category, person, place, and topic can be edited or deleted directly in the Timeline.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 03: NO FIDUCIARY RELATIONSHIP & LINKS ── */}
        <section className={styles.chapterSection} aria-labelledby="disclaimer-03-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              03 — Legal Scope
            </span>
            <h2 id="disclaimer-03-heading" className={styles.chapterTitle}>
              No Fiduciary Relationship
            </h2>
            <p className={styles.chapterLead}>
              Using Life Memory does not establish any clinical, legal, or advisory duty of care.
            </p>
            <span className={styles.chapterMetaBadge}>Governance</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.proseBlock}>
              <p className={styles.proseParagraph}>
                Your use of Life Memory does not create a doctor-patient, therapist-client, attorney-client, or fiduciary relationship between you and Life Memory, its creators, or its infrastructure providers. We build Life Memory with reverence for everyday human experience—to help you remember your days clearly and keep complete sovereignty over your personal record.
              </p>
            </div>

            <div className={styles.complianceBar}>
              <p className={styles.complianceText}>
                Inspect your entries or review our companion governance documents:
              </p>
              <div className={styles.complianceLinks}>
                <Link href="/timeline?demo=jimmy" className={styles.complianceLink}>
                  <span>Open Timeline Editor</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link href="/privacy" className={styles.complianceLink}>
                  <span>Privacy Policy</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link href="/terms" className={styles.complianceLink}>
                  <span>Terms of Service</span>
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
