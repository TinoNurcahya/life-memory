import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, MapPin, Sparkles, Tag, User } from "lucide-react";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import styles from "@/components/editorial/About.module.css";

export const metadata: Metadata = {
  title: "Origin & Philosophy · Life Memory",
  description:
    "Why we built Life Memory: an autobiographical life archive designed to counter memory decay through structured entity extraction, grounded citations, and strict data sovereignty.",
};

export default function AboutPage() {
  return (
    <EditorialShell
      badge="Origin & Philosophy"
      title="An Archive of Being Alive"
      subtitle="A life is rarely defined by monumental milestones alone—it is woven from the quiet, fleeting rhythm of ordinary days. Life Memory transforms brief daily sentences into a permanent, searchable constellation of the people, places, and first times that shape who you are."
      lastUpdated="November 2026"
      wide
    >
      <div className={styles.aboutContainer}>
        {/* Top Manifesto Telemetry Strip */}
        <div className={styles.metricsStrip} aria-label="Architecture highlights">
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>01 · Capture Latency</span>
            <span className={styles.metricValue}>&lt; 100 ms</span>
            <span className={styles.metricSub}>Optimistic atomic note persistence</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>02 · Relational Graph</span>
            <span className={styles.metricValue}>4 Dimensions</span>
            <span className={styles.metricSub}>People, Places, Topics &amp; Time</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>03 · AI Privacy Charter</span>
            <span className={styles.metricValue}>0% Training</span>
            <span className={styles.metricSub}>Ephemeral extraction · Strict RLS</span>
          </div>
          <div className={styles.metricCell}>
            <span className={styles.metricLabel}>04 · Data Sovereignty</span>
            <span className={styles.metricValue}>100% Portable</span>
            <span className={styles.metricSub}>One-click relational JSON export</span>
          </div>
        </div>

        {/* ── CHAPTER 01: EPHEMERALITY ── */}
        <section className={styles.chapterSection} aria-labelledby="chapter-01-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              01 — Ephemerality
            </span>
            <h2 id="chapter-01-heading" className={styles.chapterTitle}>
              The Quiet Tragedy of Forgetting
            </h2>
            <p className={styles.chapterLead}>
              Why human memory sheds ordinary days—and why social feeds failed to preserve them.
            </p>
            <span className={styles.chapterMetaBadge}>Hermann Ebbinghaus · 1885</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.proseBlock}>
              <p className={styles.proseParagraph}>
                In 1885, psychologist Hermann Ebbinghaus mapped the mathematical trajectory of human forgetting: within twenty-four hours of living through an ordinary day, nearly <strong>70% of its texture</strong> vanishes from active recall. Within thirty days, without deliberate reinforcement, more than <strong>80% dissolves</strong> into an indistinct blur. We remember isolated peaks, but lose the quiet progression between them.
              </p>
              <p className={styles.proseParagraph}>
                Modern digital tools promised total recall, yet engineered a new kind of amnesia. Social networks reward public performance over private honesty; chat threads bury meaningful afternoons beneath thousands of ephemeral notifications; traditional journaling apps demand rigid folders, manual tags, and long-form essays that collapse the moment life gets busy.
              </p>
            </div>

            {/* Visual Specimen: Biological Decay vs. Living Archive */}
            <div className={styles.decayComparisonGrid}>
              <div className={styles.specimenCard}>
                <div className={styles.specimenHeader}>
                  <span className={styles.specimenEyebrow}>Specimen A · Unassisted Recall</span>
                  <span className={styles.specimenEyebrow}>Ebbinghaus Curve</span>
                </div>
                <p className={styles.specimenTitle}>Biological Memory Decay</p>
                <div className={styles.decayBars}>
                  <div className={styles.decayRow}>
                    <div className={styles.decayRowMeta}>
                      <span>After 24 Hours</span>
                      <span>~30% detail retained</span>
                    </div>
                    <div className={styles.decayTrack}>
                      <div className={styles.decayFillMuted} style={{ width: "30%" }} />
                    </div>
                  </div>
                  <div className={styles.decayRow}>
                    <div className={styles.decayRowMeta}>
                      <span>After 7 Days</span>
                      <span>~18% detail retained</span>
                    </div>
                    <div className={styles.decayTrack}>
                      <div className={styles.decayFillMuted} style={{ width: "18%" }} />
                    </div>
                  </div>
                  <div className={styles.decayRow}>
                    <div className={styles.decayRowMeta}>
                      <span>After 30 Days</span>
                      <span>&lt;12% routine context</span>
                    </div>
                    <div className={styles.decayTrack}>
                      <div className={styles.decayFillMuted} style={{ width: "12%" }} />
                    </div>
                  </div>
                </div>
                <p className={styles.specimenFootnote}>
                  First encounters, quiet habits, and recurring places fade into a single compressed impression.
                </p>
              </div>

              <div className={`${styles.specimenCard} ${styles.specimenCardHighlight}`}>
                <div className={styles.specimenHeader}>
                  <span className={`${styles.specimenEyebrow} ${styles.specimenEyebrowAccent}`}>
                    Specimen B · Life Memory Vault
                  </span>
                  <span className={styles.specimenEyebrow}>Longitudinal Index</span>
                </div>
                <p className={styles.specimenTitle}>Structured Atomic Preservation</p>
                <div className={styles.decayBars}>
                  <div className={styles.decayRow}>
                    <div className={styles.decayRowMeta}>
                      <span>Atomic Sentence &amp; Timestamp</span>
                      <span>100% indexed</span>
                    </div>
                    <div className={styles.decayTrack}>
                      <div className={styles.decayFillPrimary} style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div className={styles.decayRow}>
                    <div className={styles.decayRowMeta}>
                      <span>People, Places &amp; Topics Graph</span>
                      <span>100% cross-linked</span>
                    </div>
                    <div className={styles.decayTrack}>
                      <div className={styles.decayFillPrimary} style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div className={styles.decayRow}>
                    <div className={styles.decayRowMeta}>
                      <span>First-Time &amp; Dormant Rediscovery</span>
                      <span>100% deterministic</span>
                    </div>
                    <div className={styles.decayTrack}>
                      <div className={styles.decayFillPrimary} style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
                <p className={styles.specimenFootnote}>
                  One natural sentence is enough—every entity and milestone remains permanently retrievable.
                </p>
              </div>
            </div>

            <blockquote className={styles.pullQuote}>
              <p className={styles.pullQuoteText}>
                &ldquo;Facts before narrative. Evidence before confidence. What if your daily notes could become a living, verifiable representation of your life?&rdquo;
              </p>
              <footer className={styles.pullQuoteCaption}>
                Core Design Principle · Life Memory Architecture
              </footer>
            </blockquote>
          </div>
        </section>

        {/* ── CHAPTER 02: THE 4D LIVING CONSTELLATION ── */}
        <section className={styles.chapterSection} aria-labelledby="chapter-02-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              02 — Living Constellation
            </span>
            <h2 id="chapter-02-heading" className={styles.chapterTitle}>
              From One Sentence to Four Dimensions
            </h2>
            <p className={styles.chapterLead}>
              Write naturally without folders or manual tags. Asynchronous extraction builds the relational graph behind the scenes.
            </p>
            <span className={styles.chapterMetaBadge}>Zero-Friction Logging</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.proseBlock}>
              <p className={styles.proseParagraph}>
                Life Memory separates the act of <strong>remembering</strong> from the chore of <strong>organizing</strong>. When you record a quick sentence in the Quick Logger, it saves optimistically in under 100 milliseconds. In the background, our structured extraction pipeline parses the note into four interconnected dimensions:
              </p>
            </div>

            {/* Live Extraction Specimen */}
            <div className={styles.extractionSpecimen}>
              <div className={styles.extractionTop}>
                <div className={styles.extractionStepLabel}>
                  <span>Input · Raw Natural-Language Note</span>
                  <span>Saved in 42ms · Nov 10, 2026</span>
                </div>
                <p className={styles.rawNoteQuote}>
                  &ldquo;Met Maya at Blue Bottle in SoHo this morning and sketched out the WebGL shader pipeline for the first time.&rdquo;
                </p>
              </div>
              <div className={styles.extractionBottom}>
                <div className={styles.extractionStepLabel}>
                  <span>Output · Extracted Relational Entities</span>
                  <span>Confidence: 0.96 · Verified</span>
                </div>
                <div className={styles.chipRow}>
                  <span className={`${styles.entityChip} ${styles.chipPerson}`}>
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Person · Maya</span>
                  </span>
                  <span className={`${styles.entityChip} ${styles.chipPlace}`}>
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Place · Blue Bottle, SoHo</span>
                  </span>
                  <span className={`${styles.entityChip} ${styles.chipTopic}`}>
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Topic · WebGL Shader Pipeline</span>
                  </span>
                  <span className={`${styles.entityChip} ${styles.chipFirstTime}`}>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>✦ First-Time Milestone</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Dimension Matrix Grid */}
            <div className={styles.dimensionGrid}>
              <Link href="/people?demo=jimmy" className={styles.dimensionCard}>
                <div>
                  <span className={styles.dimensionIndex}>Dimension 01 · People</span>
                  <h3 className={styles.dimensionHeading}>The Ties That Bind</h3>
                  <p className={styles.dimensionBody}>
                    Automatically builds a personal index of friends, mentors, and collaborators—surfacing shared chapters, first meetings, and quiet relationship rhythms.
                  </p>
                </div>
                <span className={styles.dimensionLinkRow}>
                  <span>Inspect People Constellation</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>

              <Link href="/places?demo=jimmy" className={styles.dimensionCard}>
                <div>
                  <span className={styles.dimensionIndex}>Dimension 02 · Places</span>
                  <h3 className={styles.dimensionHeading}>The Geography of Memory</h3>
                  <p className={styles.dimensionBody}>
                    Anchors moments to physical spaces—neighborhood cafes, studios, parks, and cities—mapping where your most meaningful work and conversations unfold.
                  </p>
                </div>
                <span className={styles.dimensionLinkRow}>
                  <span>Inspect Places Directory</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>

              <Link href="/topics?demo=jimmy" className={styles.dimensionCard}>
                <div>
                  <span className={styles.dimensionIndex}>Dimension 03 · Topics</span>
                  <h3 className={styles.dimensionHeading}>Curiosity &amp; Craft</h3>
                  <p className={styles.dimensionBody}>
                    Tracks recurring skills, books, technologies, and creative pursuits across months so you can see the compound trajectory of your learning.
                  </p>
                </div>
                <span className={styles.dimensionLinkRow}>
                  <span>Inspect Topics &amp; Skills</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>

              <Link href="/forgot-this?demo=jimmy" className={styles.dimensionCard}>
                <div>
                  <span className={styles.dimensionIndex}>Dimension 04 · Temporal Rhythm</span>
                  <h3 className={styles.dimensionHeading}>You Probably Forgot This</h3>
                  <p className={styles.dimensionBody}>
                    Our deterministic S-14 scoring engine resurfaces older, high-significance memories and dormant chapters right when they deserve a second look.
                  </p>
                </div>
                <span className={styles.dimensionLinkRow}>
                  <span>Open Forgotten Memory Reveal</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 03: ETHICAL AI & DATA SOVEREIGNTY CHARTER ── */}
        <section className={styles.chapterSection} aria-labelledby="chapter-03-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              03 — Ethical AI Charter
            </span>
            <h2 id="chapter-03-heading" className={styles.chapterTitle}>
              Strict Privacy &amp; Grounded Truth
            </h2>
            <p className={styles.chapterLead}>
              Autobiographical memory requires uncompromising tenant isolation, verifiable citations, and complete ownership of your data.
            </p>
            <span className={styles.chapterMetaBadge}>Supabase RLS · Zero Training</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.proseBlock}>
              <p className={styles.proseParagraph}>
                An archive of your life is only trustworthy if it never invents details and never treats your private reflections as training fodder. Life Memory is governed by four non-negotiable engineering commitments:
              </p>
            </div>

            <div className={styles.charterGrid}>
              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Pillar I · Confidentiality</span>
                  <span className={styles.charterCheck}>Enforced</span>
                </div>
                <h3 className={styles.charterTitle}>Zero Model Training</h3>
                <p className={styles.charterText}>
                  Your personal entries, names, photos, and reflections are processed ephemerally and are never used to train, fine-tune, or improve foundation AI models.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Pillar II · Epistemic Integrity</span>
                  <span className={styles.charterCheck}>Verified [1][2]</span>
                </div>
                <h3 className={styles.charterTitle}>Grounded Footnote Citations</h3>
                <p className={styles.charterText}>
                  Every Monthly Reflection essay and Ask Memory response cites the exact atomic notes (`[1]`, `[2]`) it draws from. We never fabricate memories or speculate about emotions.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Pillar III · Determinism</span>
                  <span className={styles.charterCheck}>Pure SQL / TS</span>
                </div>
                <h3 className={styles.charterTitle}>Deterministic Pattern Engine</h3>
                <p className={styles.charterText}>
                  First-time detection, recurrence streaks, and the S-14 &ldquo;You Probably Forgot This&rdquo; scoring engine run on deterministic algorithms—never ungrounded LLM guesses.
                </p>
              </div>

              <div className={styles.charterCard}>
                <div className={styles.charterHeader}>
                  <span className={styles.charterPillarTag}>Pillar IV · Portability</span>
                  <span className={styles.charterCheck}>1-Click JSON</span>
                </div>
                <h3 className={styles.charterTitle}>100% Data Sovereignty</h3>
                <p className={styles.charterText}>
                  Every row in your archive is protected by PostgreSQL Row-Level Security (`auth.uid() = user_id`) and can be exported in full relational JSON from Settings at any time.
                </p>
              </div>
            </div>

            {/* Crawlable Compliance & Legal Verification Bar */}
            <div className={styles.complianceBar}>
              <p className={styles.complianceText}>
                Review our public legal commitments, data handling specifications, and AI safety boundaries:
              </p>
              <div className={styles.complianceLinks}>
                <Link href="/privacy" className={styles.complianceLink}>
                  <span>Privacy Policy</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link href="/terms" className={styles.complianceLink}>
                  <span>Terms of Service</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link href="/disclaimer" className={styles.complianceLink}>
                  <span>AI Safety Disclaimer</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHAPTER 04: COLOPHON & ENTRY ── */}
        <section className={styles.chapterSection} aria-labelledby="chapter-04-heading">
          <div className={styles.indexColumn}>
            <span className={styles.chapterNumber}>
              <span className={styles.chapterDot} aria-hidden="true" />
              04 — Colophon &amp; Entry
            </span>
            <h2 id="chapter-04-heading" className={styles.chapterTitle}>
              Step Inside the Archive
            </h2>
            <p className={styles.chapterLead}>
              Explore Jimmy&apos;s 48-memory sample vault immediately, or open your own private archive.
            </p>
            <span className={styles.chapterMetaBadge}>Open Access Demo</span>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.ctaCard}>
              <h3 className={styles.ctaHeadline}>
                Start with one small moment today.
              </h3>
              <p className={styles.ctaBody}>
                You do not need to write a whole chapter to begin. Record a single sentence about where you were or who you met today—or explore Jimmy&apos;s pre-populated archive to experience the timeline, visual calendar, constellations, and monthly reflection firsthand.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/dashboard?demo=jimmy" className={styles.ctaPrimaryBtn}>
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <span>Explore Jimmy&apos;s Demo Vault</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/register" className={styles.ctaSecondaryBtn}>
                  <span>Create Private Archive</span>
                </Link>
                <Link href="/login" className={styles.ctaSecondaryBtn}>
                  <span>Sign In</span>
                </Link>
              </div>
              <div className={styles.colophonStrip}>
                <span>Life Memory · Personal Memory Intelligence</span>
                <span>Next.js 16 · TypeScript · Supabase PostgreSQL RLS · Google Gemini</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </EditorialShell>
  );
}
