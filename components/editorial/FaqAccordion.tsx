"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Compass } from "lucide-react";
import styles from "./About.module.css";

interface FaqItem {
  id: string;
  code: string;
  category: "general" | "ai" | "privacy" | "features";
  question: string;
  answer: string;
}

interface FaqDomainSection {
  id: "general" | "ai" | "privacy" | "features";
  indexLabel: string;
  title: string;
  lead: string;
  badge: string;
}

const FAQ_SECTIONS: FaqDomainSection[] = [
  {
    id: "general",
    indexLabel: "01 — General & Philosophy",
    title: "The Living Archive",
    lead: "How stream-of-consciousness micro-logging replaces rigid folders and manual tags.",
    badge: "3 Questions",
  },
  {
    id: "ai",
    indexLabel: "02 — AI & Grounding",
    title: "Gemini & Citations",
    lead: "How asynchronous entity extraction and deterministic footnote validation work.",
    badge: "3 Questions",
  },
  {
    id: "privacy",
    indexLabel: "03 — Privacy & RLS",
    title: "Security & Sovereignty",
    lead: "Zero model training commitments, PostgreSQL Row-Level Security, and 1-click JSON export.",
    badge: "3 Questions",
  },
  {
    id: "features",
    indexLabel: "04 — Features & Recall",
    title: "Rediscovery & Tools",
    lead: "Exploring the S-14 Forgotten Memory engine, Evidence Drawer, and Ask Memory chat.",
    badge: "3 Questions",
  },
];

const FAQ_DATA: FaqItem[] = [
  {
    id: "gen-1",
    code: "Q-01",
    category: "general",
    question: "What is Life Memory, and how does it differ from a traditional journal app?",
    answer:
      "Traditional journal apps place the organizational burden entirely on you: inventing tags, choosing folders, or facing intimidating blank pages. Life Memory is built around natural, stream-of-consciousness micro-logging. You write a single sentence (e.g., 'Coffee with Ethan at the library yesterday morning to debug the API timeout'), and our pipeline automatically reconstructs the people, places, topics, temporal rhythm, and recurring patterns in the background.",
  },
  {
    id: "gen-2",
    code: "Q-02",
    category: "general",
    question: "Can I explore Life Memory without creating an account?",
    answer:
      "Yes. You can launch Jimmy's Demo Vault immediately at /dashboard?demo=jimmy without entering an email address. The sample archive contains 48 curated memories across 56 days—complete with extracted people, places, topics, visual calendar entries, pattern insights, and monthly footnote reflections.",
  },
  {
    id: "gen-3",
    code: "Q-03",
    category: "general",
    question: "Is there a subscription fee or usage limit?",
    answer:
      "During our public release, Life Memory is free for personal use. You can log memories, search your timeline, converse with Ask Memory, generate monthly reflection essays, and export your full JSON archive without paywalls.",
  },
  {
    id: "ai-1",
    code: "Q-04",
    category: "ai",
    question: "Which AI models power Life Memory's extraction and reflections?",
    answer:
      "Life Memory uses Google's Gemini 3.5 & 3.8 Flash model family via enterprise APIs. Quick Logger saves your raw sentence optimistically in under 100ms, while Gemini asynchronously extracts people, places, topics, and first-time experiences. Monthly Reflections and Ask Memory use grounded citation prompts that strictly reference your own logged records.",
  },
  {
    id: "ai-2",
    code: "Q-05",
    category: "ai",
    question: "Does the AI ever hallucinate or invent memories I never logged?",
    answer:
      "No. Every statement in a Monthly Reflection or Ask Memory response must cite a verified atomic record using continuous footnotes ([1], [2]). If a generated sentence references an unverified ID, our deterministic citation validator strips it before rendering. Furthermore, First-Time detection and S-14 Forgotten Memory selection are 100% deterministic algorithms—not LLM guesses.",
  },
  {
    id: "ai-3",
    code: "Q-06",
    category: "ai",
    question: "Can I edit or override the entities extracted by AI?",
    answer:
      "Yes—you retain 100% human-in-the-loop authority. In the Timeline view (/timeline), you can edit any activity's text, change its category (Learning, Career, Health, Social, Leisure, Routine), or refine extracted people, places, and topics at any time.",
  },
  {
    id: "priv-1",
    code: "Q-07",
    category: "privacy",
    question: "Are my personal memories ever used to train AI models?",
    answer:
      "Never. Payloads sent to Google Gemini enterprise APIs are processed ephemerally in volatile memory solely to return your structured tags or reflection response, and are governed by a strict zero-training commitment.",
  },
  {
    id: "priv-2",
    code: "Q-08",
    category: "privacy",
    question: "How is my archive isolated from other users in the database?",
    answer:
      "Your archive is stored on Supabase PostgreSQL with database-level Row-Level Security (RLS) enforced across every relational table (auth.uid() = user_id). Even at the SQL engine layer, a session can only read or mutate rows owned by its cryptographic user ID.",
  },
  {
    id: "priv-3",
    code: "Q-09",
    category: "privacy",
    question: "How do I export my data or permanently delete my account?",
    answer:
      "Open Settings & Data (/settings) at any time and click 'Export JSON' to download your complete relational archive in a single portable file. If you ever wish to leave, you can trigger a permanent, cascading purge of your account and all associated records.",
  },
  {
    id: "feat-1",
    code: "Q-10",
    category: "features",
    question: "How does the 'You Probably Forgot This' (S-14) engine work?",
    answer:
      "S-14 is a 100% deterministic scoring algorithm that counters memory decay. It evaluates memories logged at least 14 days ago whose associated people, places, or topics have gone unmentioned for 21+ days, surfacing high-significance moments that have quietly slipped out of recent routine.",
  },
  {
    id: "feat-2",
    code: "Q-11",
    category: "features",
    question: "What is the Evidence Drawer on the Pattern Insights page?",
    answer:
      "Every pattern card on /insights (such as a recurring habit, a first-time milestone, or a monthly category shift) is backed by concrete evidence. Clicking any insight opens the Evidence Drawer showing the exact dated journal notes that produced that finding.",
  },
  {
    id: "feat-3",
    code: "Q-12",
    category: "features",
    question: "Can I log new memories directly from the Ask Memory (/chat) page?",
    answer:
      "Yes. While chatting with Ask Memory (/chat) to recall past events, you can also save any note directly into your timeline with a single click—bridging conversational reflection and daily capture.",
  },
];

const FILTER_OPTIONS = [
  { id: "all", label: "All Domains (12)" },
  { id: "general", label: "01 · General (3)" },
  { id: "ai", label: "02 · AI & Grounding (3)" },
  { id: "privacy", label: "03 · Privacy & RLS (3)" },
  { id: "features", label: "04 · Features (3)" },
] as const;

export function FaqAccordion() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>("gen-1");

  const visibleSections =
    activeCategory === "all"
      ? FAQ_SECTIONS
      : FAQ_SECTIONS.filter((sec) => sec.id === activeCategory);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.aboutContainer}>
      {/* Top Telemetry Strip */}
      <div className={styles.metricsStrip} aria-label="Knowledge base overview">
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>01 · Knowledge Base</span>
          <span className={styles.metricValue}>12 Answers</span>
          <span className={styles.metricSub}>Core architecture &amp; usage guide</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>02 · Domains Covered</span>
          <span className={styles.metricValue}>4 Pillars</span>
          <span className={styles.metricSub}>Philosophy, AI, Privacy &amp; Tools</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>03 · AI Hallucination</span>
          <span className={styles.metricValue}>0% Tolerated</span>
          <span className={styles.metricSub}>Strict [1][2] citation validator</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>04 · Sandbox Access</span>
          <span className={styles.metricValue}>48 Memories</span>
          <span className={styles.metricSub}>Instant zero-signup Jimmy demo</span>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className={styles.faqFilterBar} role="tablist" aria-label="Filter FAQ by domain">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeCategory === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(opt.id)}
              className={`${styles.faqFilterBtn} ${
                isActive ? styles.faqFilterBtnActive : ""
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 2-Column Editorial Index Sections */}
      {visibleSections.map((section) => {
        const items = FAQ_DATA.filter((item) => item.category === section.id);
        return (
          <section
            key={section.id}
            className={styles.chapterSection}
            aria-labelledby={`faq-sec-${section.id}`}
          >
            <div className={styles.indexColumn}>
              <span className={styles.chapterNumber}>
                <span className={styles.chapterDot} aria-hidden="true" />
                {section.indexLabel}
              </span>
              <h2 id={`faq-sec-${section.id}`} className={styles.chapterTitle}>
                {section.title}
              </h2>
              <p className={styles.chapterLead}>{section.lead}</p>
              <span className={styles.chapterMetaBadge}>{section.badge}</span>
            </div>

            <div className={styles.contentColumn}>
              <div className={styles.faqList}>
                {items.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`${styles.faqItemCard} ${
                        isOpen ? styles.faqItemCardOpen : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(faq.id)}
                        className={styles.faqTrigger}
                        aria-expanded={isOpen}
                      >
                        <span className={styles.faqQuestionWrap}>
                          <span className={styles.faqIndexBadge}>{faq.code}</span>
                          <span className={styles.faqQuestionText}>
                            {faq.question}
                          </span>
                        </span>
                        <span
                          className={`${styles.faqChevronBadge} ${
                            isOpen ? styles.faqChevronBadgeOpen : ""
                          }`}
                          aria-hidden="true"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </span>
                      </button>

                      {isOpen && (
                        <div className={styles.faqAnswer}>{faq.answer}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* Closing CTA Row */}
      <section className={styles.chapterSection} aria-labelledby="faq-support-heading">
        <div className={styles.indexColumn}>
          <span className={styles.chapterNumber}>
            <span className={styles.chapterDot} aria-hidden="true" />
            05 — Direct Support
          </span>
          <h2 id="faq-support-heading" className={styles.chapterTitle}>
            Still Curious?
          </h2>
          <p className={styles.chapterLead}>
            Test the full system live in Jimmy&apos;s Demo Vault or reach out directly.
          </p>
        </div>

        <div className={styles.contentColumn}>
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaHeadline}>
              Experience the archive firsthand.
            </h3>
            <p className={styles.ctaBody}>
              The fastest way to understand Life Memory is to explore Jimmy&apos;s 48-memory sample archive or reach out to our team with any technical or privacy questions.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/dashboard?demo=jimmy" className={styles.ctaPrimaryBtn}>
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>Explore Jimmy&apos;s Demo Vault</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="mailto:tinonurcahya.ti@gmail.com"
                className={styles.ctaSecondaryBtn}
              >
                <span>Contact Support</span>
              </a>
              <Link href="/about" className={styles.ctaSecondaryBtn}>
                <span>Read Our Philosophy</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
