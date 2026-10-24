import type { Metadata } from "next";
import Link from "next/link";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import { Scale, Award, AlertCircle, FileCheck, Check, ShieldAlert } from "lucide-react";

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
      subtitle="Clear, fair, and respectful terms governing your personal archive. We believe software terms should be straightforward, emphasizing user ownership above all else."
      lastUpdated="October 20, 2026"
    >
      <div className="space-y-10 text-muted text-base leading-relaxed">
        {/* Core Principle Callout */}
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-brand font-semibold">The Fundamental Rule</p>
          <p className="mt-2 text-sm text-foreground leading-relaxed">
            Your memories belong to you. We do not claim any copyright, trademark, or proprietary interest in any journal entry, personal reflection, relationship mention, or idea you commit to Life Memory.
          </p>
        </div>

        {/* 1. Acceptance of Terms */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <Scale className="h-5 w-5 text-brand" />
            <span>1. Acceptance &amp; Eligibility</span>
          </h2>
          <p>
            By accessing or creating an account on Life Memory (&ldquo;the Service&rdquo;), you enter into a binding agreement governed by these Terms. To use the Service, you must be at least 18 years of age or possess the legal consent of a parent or guardian.
          </p>
        </section>

        {/* 2. Intellectual Property & License */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-brand" />
            <span>2. Intellectual Property &amp; Your License to Us</span>
          </h2>
          <p>
            You retain full, unrestricted intellectual property rights over all content you log, upload, or generate within Life Memory.
          </p>
          <p className="text-sm">
            You grant Life Memory only a limited, revocable, non-exclusive license strictly necessary to operate the application on your behalf: to encrypt, store, retrieve, and transmit your text to Google Gemini API endpoints solely for the purpose of entity extraction, statistical derivation, and reflection rendering for your private view.
          </p>
        </section>

        {/* 3. Acceptable Use Policy */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand" />
            <span>3. Acceptable Use Policy</span>
          </h2>
          <p>Life Memory is built as a personal sanctuary for honest self-reflection. You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li>Attempt to reverse-engineer, decompile, or extract the underlying algorithms of the Service or its API connectors.</li>
            <li>Use the Service to transmit automated spam, denial-of-service payloads, or malicious scripts.</li>
            <li>Attempt unauthorized access to other user database partitions through SQL injection, authentication bypass, or exploit of Row Level Security.</li>
            <li>Store content that constitutes illegal activity under applicable local or international laws.</li>
          </ul>
        </section>

        {/* 4. AI Introspection & Warranties */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand" />
            <span>4. Nature of AI Reflections &amp; Disclaimers</span>
          </h2>
          <p>
            AI-generated pattern summaries, forgotten memory notifications (S-14), and monthly reflections are computational interpretations intended for personal nostalgia and retrospection. They do not constitute certified medical, psychiatric, financial, or legal counsel.
          </p>
          <p className="text-sm">
            For further details, please review our comprehensive <Link href="/disclaimer" className="text-brand hover:underline">AI Safety &amp; Medical Disclaimer</Link>.
          </p>
        </section>

        {/* 5. Account Termination & Data Export */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-brand" />
            <span>5. Account Termination &amp; Portability</span>
          </h2>
          <p>
            You may terminate your account at any time with immediate effect via the Danger Zone in <Link href="/settings" className="text-brand hover:underline">Settings</Link>. Upon confirmation, all your activities, details, entities, and reflection records are irreversibly purged from our active PostgreSQL cluster.
          </p>
          <p className="text-sm">
            We strongly encourage archiving your life memories regularly using our 1-click full JSON export feature (<Link href="/settings" className="text-brand hover:underline">Settings &rarr; Export</Link>).
          </p>
        </section>

        {/* 6. Contact */}
        <section className="space-y-2 border-t border-hairline/80 pt-6">
          <h2 className="font-serif text-xl font-medium text-foreground">6. Questions Regarding Terms</h2>
          <p className="text-sm">
            If you have questions or require clarifications concerning these Terms, reach out to our legal coordination team at <span className="font-mono text-foreground">legal@lifememory.app</span>.
          </p>
        </section>
      </div>
    </EditorialShell>
  );
}
