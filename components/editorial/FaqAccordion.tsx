"use client";

import { useState } from "react";
import { ChevronDown, Bot, ShieldCheck, Compass, HelpCircle } from "lucide-react";

interface FaqItem {
  id: string;
  category: "general" | "ai" | "privacy" | "features";
  question: string;
  answer: string | React.ReactNode;
}

const FAQ_DATA: FaqItem[] = [
  // Category: General
  {
    id: "gen-1",
    category: "general",
    question: "What is Life Memory, and how does it differ from a traditional journal app?",
    answer:
      "Traditional journal apps place the cognitive burden entirely on you: you must manually categorize entries, invent tags, or remember to open blank pages. Life Memory is an autobiographical archive designed around natural, stream-of-consciousness writing. You write raw, unstructured thoughts (e.g. 'Coffee with Ethan at the library yesterday morning to debug the API timeout'), and our intelligent engine automatically reconstructs the people, places, topics, temporal rhythm, and recurring life patterns in the background.",
  },
  {
    id: "gen-2",
    category: "general",
    question: "Can I try Life Memory without creating an account?",
    answer:
      "Yes! We provide an instant, zero-friction interactive demo featuring the persona of 'Jimmy', an engineering student. The Jimmy dataset contains 48 authentic memories spanning 56 dynamic relative days, complete with real entities, pattern insights, and monthly reflections. You can explore the entire system at /dashboard?demo=jimmy without giving up any personal email or credit card.",
  },
  {
    id: "gen-3",
    category: "general",
    question: "Is there a subscription fee or usage limit?",
    answer:
      "During our public launch phase, Life Memory is free for personal use. You can log unlimited memories, query the AI chat assistant, generate monthly reflection magazines, and export your complete archive at any time.",
  },

  // Category: AI & Gemini Intelligence
  {
    id: "ai-1",
    category: "ai",
    question: "Which artificial intelligence models power Life Memory?",
    answer:
      "Life Memory utilizes Google's state-of-the-art Gemini 3.5 & 3.8 Flash model family. For fast conversational memory queries and note saving in chat, we use gemini-3.5-flash-lite, delivering responses in ~1.6 to 2 seconds. For deep narrative generation, such as our monthly reflection essays, we utilize gemini-3.8-flash with an evidence-grounded citation cascade.",
  },
  {
    id: "ai-2",
    category: "ai",
    question: "Does the AI hallucinate or make up memories I never logged?",
    answer:
      "No. We enforce strict mathematical and factual grounding rules. In our monthly reflections, every single statement must link to a verified atomic activity_detail_id, accompanied by global continuous footnotes [1]..[N]. If the AI attempts to mention an event without a matching source record, our deterministic citation validator rejects the claim. In the chat assistant, context is strictly restricted to your logged memories.",
  },
  {
    id: "ai-3",
    category: "ai",
    question: "Can I edit or override the AI's entity extractions?",
    answer:
      "Absolutely. In the /timeline view, you have 100% human-in-the-loop control. You can change any activity category (e.g. Career, Social, Health, Learning, Leisure), remove erroneously linked entities, or manually add custom people, places, and topics.",
  },

  // Category: Privacy & Security
  {
    id: "priv-1",
    category: "privacy",
    question: "Are my personal memories used to train Google or OpenAI models?",
    answer:
      "Strictly and emphatically NO. We use enterprise Google Gemini API endpoints, which operate under Google Cloud's enterprise terms: your data is never used to train, tune, or improve foundation models. Furthermore, payloads are processed ephemerally in memory only for the duration of inference and are immediately discarded.",
  },
  {
    id: "priv-2",
    category: "privacy",
    question: "How is my database isolated from other users?",
    answer:
      "Your private archive is hosted on Supabase PostgreSQL with database-level Row Level Security (RLS) enabled on all 10 relational tables. Every database query checks auth.uid() = user_id. Even if an attacker attempts unauthorized queries, PostgreSQL directly enforces cryptographic tenant isolation.",
  },
  {
    id: "priv-3",
    category: "privacy",
    question: "How do I export or delete my entire archive?",
    answer:
      "You have absolute data sovereignty. Go to Settings at any time to download your complete archive (all 10 relational tables including activities, details, people, places, topics, and insights) in standard JSON format. If you choose to leave, our Danger Zone allows you to type 'DELETE' to trigger an irreversible, cascading erasure of all your data.",
  },

  // Category: Features & Experience
  {
    id: "feat-1",
    category: "features",
    question: "What is the 'You Probably Forgot This' (S-14) feature?",
    answer:
      "S-14 is our deterministic nostalgia algorithm designed to counter memory decay. It identifies authentic activities logged at least 14 days ago whose primary entities (a specific friend, place, or topic) haven't been mentioned in your notes for over 21 days. It surfaces a forgotten moment to gently trigger positive retrospection.",
  },
  {
    id: "feat-2",
    category: "features",
    question: "What is the Interactive Evidence Drawer (Vaul)?",
    answer:
      "On the /insights page, our analytics engine derives high-level life patterns (e.g., 'Third coffee with Ethan this month' or 'Shift toward outdoor runs'). Clicking any pattern opens a smooth bottom drawer (powered by Vaul) that displays the exact atomic journal entries and highlighted keywords that proved the pattern.",
  },
  {
    id: "feat-3",
    category: "features",
    question: "Can I use the AI Chat to log new notes directly?",
    answer:
      "Yes! When speaking with the AI in /chat, you can simply type 'Catat ini: ...' or click the 'Simpan ke Catatan' button beneath any assistant response. The AI will extract the entities and save it directly to your timeline without you needing to leave the chat.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "general", label: "General & Philosophy", icon: Compass },
  { id: "ai", label: "AI & Gemini Tech", icon: Bot },
  { id: "privacy", label: "Privacy & Security", icon: ShieldCheck },
  { id: "features", label: "Features & Tips", icon: HelpCircle },
] as const;

export function FaqAccordion() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>("gen-1");

  const filteredFaqs =
    activeCategory === "all"
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === activeCategory);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-xs transition-all ${
                isActive
                  ? "bg-brand text-white shadow-xs"
                  : "border border-hairline bg-surface text-muted hover:border-brand/40 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion Cards */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-brand/40 bg-surface shadow-xs"
                  : "border-hairline bg-surface/60 hover:border-hairline/80 hover:bg-surface"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-serif text-lg sm:text-xl font-medium text-foreground pr-4">
                  {faq.question}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-subdued text-muted transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-brand/10 text-brand border-brand/30" : ""
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-hairline/60 px-5 pb-6 pt-4 sm:px-6 sm:pb-6 text-sm text-muted leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions CTA */}
      <div className="rounded-2xl border border-hairline bg-surface-subdued/50 p-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left gap-4">
        <div>
          <h3 className="font-serif text-lg font-medium text-foreground">Have a question not listed here?</h3>
          <p className="mt-1 text-xs text-muted">
            Our team and documentation are always open. Drop us an inquiry anytime.
          </p>
        </div>
        <a
          href="mailto:support@lifememory.app"
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-4 py-2 font-mono text-xs text-foreground transition hover:bg-surface-elevated"
        >
          Contact Support →
        </a>
      </div>
    </div>
  );
}
