import type { Metadata } from "next";
import Link from "next/link";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import { AlertTriangle, HeartHandshake, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Safety & Medical Disclaimer · Life Memory",
  description:
    "Important safety notice and disclaimer. Life Memory is a reflective autobiographical journaling tool, not a provider of medical, psychological, or psychiatric advice.",
};

export default function DisclaimerPage() {
  return (
    <EditorialShell
      badge="Safety & Medical Notice"
      title="Disclaimer &amp; AI Safety"
      subtitle="Life Memory is designed as a sanctuary for self-reflection and autobiographical continuity. Please read this statement regarding the scope and limitations of our application."
      lastUpdated="October 20, 2026"
    >
      <div className="space-y-10 text-muted text-base leading-relaxed">
        {/* Critical Notice Callout */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-foreground">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs uppercase font-bold tracking-wider">
            <AlertTriangle className="h-4 w-4" />
            <span>Important Healthcare Notice</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            Life Memory is <strong>not</strong> a medical device, mental health clinic, or suicide prevention service. The software, its AI extraction pipelines, monthly reflection essays, and interactive chat assistant are designed strictly for personal retrospection, memory preservation, and introspective journaling. They do not constitute licensed psychiatric, psychological, clinical, medical, legal, or financial counsel.
          </p>
        </div>

        {/* 1. Psychological & Medical Disclaimer */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-brand" />
            <span>1. Mental Health &amp; Medical Disclaimer</span>
          </h2>
          <p>
            Journaling can be a deeply rewarding practice for emotional clarity and self-awareness. However, conversations with our AI assistant (Tanya AI) and generated reflections are computational syntheses based on text you provided.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>The Service cannot diagnose, treat, prevent, or cure any mental or physical illness, mood disorder, anxiety, depression, trauma, or cognitive impairment.</li>
            <li>Never disregard professional psychiatric or medical advice or delay seeking care because of an insight, reflection, or pattern surfaced by Life Memory.</li>
            <li>If you are experiencing a mental health emergency, severe emotional distress, or thoughts of self-harm, please reach out to emergency medical services or contact a certified crisis helpline immediately (e.g., dial <strong className="text-foreground">988</strong> in the US/Canada, <strong className="text-foreground">111</strong> in the UK, or your local emergency number).</li>
          </ul>
        </section>

        {/* 2. Nature of Artificial Intelligence & Grounding */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand" />
            <span>2. Nature of AI Models &amp; Factual Verification</span>
          </h2>
          <p>
            We implement industry-leading grounding algorithms (including deterministic citation validators that link reflection paragraphs to atomic journal notes). Nonetheless, generative artificial intelligence models may occasionally:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm">
            <div className="rounded-xl border border-hairline bg-surface p-4">
              <p className="font-semibold text-foreground">Extract Ambiguous Entities</p>
              <p className="mt-1 text-xs text-muted">
                Misinterpret casual nicknames, slang, or homonyms (e.g., treating &ldquo;Apple&rdquo; as a fruit instead of a technology company).
              </p>
            </div>
            <div className="rounded-xl border border-hairline bg-surface p-4">
              <p className="font-semibold text-foreground">Over-Interpret Casual Days</p>
              <p className="mt-1 text-xs text-muted">
                Infer emotional significance or shifts in routine from limited or incomplete daily notes.
              </p>
            </div>
          </div>
          <p className="text-sm pt-2">
            You are always the ultimate authority on your own life. We encourage you to use the <Link href="/timeline" className="text-brand hover:underline">Timeline editor</Link> to refine, correct, or remove any derived entities that do not reflect reality.
          </p>
        </section>

        {/* 3. No Fiduciary or Legal Relationship */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" />
            <span>3. No Fiduciary or Professional Relationship</span>
          </h2>
          <p>
            Your use of Life Memory does not establish any doctor-patient, therapist-client, attorney-client, or fiduciary relationship between you and Life Memory Inc., its developers, or its underlying infrastructure providers.
          </p>
        </section>

        {/* 4. Commitment to User Empowerment */}
        <section className="rounded-2xl border border-hairline bg-surface p-6 space-y-2">
          <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>Our Commitment to You</span>
          </h3>
          <p className="text-sm text-muted">
            We build Life Memory with deep reverence for the human condition. Our goal is to augment your natural memory, celebrate the beauty of everyday moments, and give you complete sovereignty over your autobiographical record.
          </p>
        </section>
      </div>
    </EditorialShell>
  );
}
