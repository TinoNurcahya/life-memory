import type { Metadata } from "next";
import Link from "next/link";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import { Lock, Database, EyeOff, FileText, UserCheck, Trash2 } from "lucide-react";

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
      subtitle="Your memories are sacred. We treat your personal journal with the highest standard of cryptographic security, strict tenant isolation, and a binding zero-training commitment."
      lastUpdated="October 20, 2026"
    >
      <div className="space-y-10 text-muted text-base leading-relaxed">
        {/* Overview Box */}
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-brand font-semibold">Summary in Plain English</p>
          <p className="mt-2 text-sm text-foreground leading-relaxed">
            We do not sell your personal data. We do not display advertisements. We do not use your memories or diary entries to train machine learning models. You maintain 100% ownership of your writing and can export or permanently delete everything at any moment.
          </p>
        </div>

        {/* 1. Information We Collect */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" />
            <span>1. Information We Collect</span>
          </h2>
          <p>We collect only the minimum necessary information required to operate your personal life archive:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li><strong>Account Credentials:</strong> Your email address and optional display name, provided during registration or Google OAuth sign-in.</li>
            <li><strong>Autobiographical Content:</strong> The raw text entries, dates, notes, and photos you explicitly input into the application.</li>
            <li><strong>Extracted Entity Structures:</strong> Structured tags derived from your notes (detected names of friends, locations, and topics), stored exclusively in your private database partition.</li>
            <li><strong>Authentication Cookies:</strong> Strictly functional, cryptographically signed HTTP-only cookies managed by Supabase to maintain your authenticated login session. We do not use advertising or tracking cookies.</li>
          </ul>
        </section>

        {/* 2. Artificial Intelligence & Gemini Data Handling */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-brand" />
            <span>2. Artificial Intelligence Processing & Google Gemini</span>
          </h2>
          <p>
            Life Memory leverages Google&apos;s state-of-the-art Gemini 3.5 &amp; 3.8 Flash model family via enterprise APIs for entity extraction, pattern synthesis, and monthly reflection generation.
          </p>
          <div className="rounded-xl border border-hairline bg-surface p-5 space-y-2.5 text-sm">
            <p className="font-semibold text-foreground">Our Binding AI Privacy Commitments:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Zero Model Training:</strong> Under Google&apos;s enterprise API terms, data sent to the Gemini API is <em>not</em> used to train, retrain, fine-tune, or improve Google foundation models.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Ephemeral Inference:</strong> Text payloads are processed in volatile memory only for the duration of the API call and are immediately purged following response generation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Human-in-the-Loop Oversight:</strong> You retain complete editorial control. Any category, person tag, or place derived by AI can be manually corrected or deleted by you at any time.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Security & Database Storage */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-brand" />
            <span>3. Cryptographic Security & Row Level Isolation</span>
          </h2>
          <p>
            Your archive is housed on enterprise-grade Supabase PostgreSQL infrastructure. We employ multiple defensive layers:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li><strong>PostgreSQL Row Level Security (RLS):</strong> Every table enforces database-level RLS policies keyed to your unique cryptographic user ID (<code className="font-mono text-xs text-foreground bg-surface-subdued px-1 py-0.5 rounded">auth.uid() = user_id</code>). No other user or unauthorized process can query or view your rows.</li>
            <li><strong>Encryption Standards:</strong> Data in transit is secured with TLS 1.3 encryption. Data at rest is encrypted using AES-256 block ciphers.</li>
            <li><strong>Isolated Demo Sandboxing:</strong> When exploring in Demo mode, all records are either mock fixtures or isolated in your browser&apos;s local memory; no remote database mutations occur.</li>
          </ul>
        </section>

        {/* 4. Your Legal Rights (GDPR & CCPA) */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-brand" />
            <span>4. Your Data Rights & Sovereignty</span>
          </h2>
          <p>
            Under the European General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and similar global frameworks, you hold the following unconditional rights:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm">
            <div className="rounded-xl border border-hairline bg-surface p-4">
              <p className="font-semibold text-foreground">Right to Portability (FR-11)</p>
              <p className="mt-1 text-xs text-muted">
                Download your complete archive across all 10 relational tables in standard JSON format at any time via <Link href="/settings" className="text-brand hover:underline">Settings</Link>.
              </p>
            </div>
            <div className="rounded-xl border border-hairline bg-surface p-4">
              <p className="font-semibold text-foreground">Right to Erasure (Danger Zone)</p>
              <p className="mt-1 text-xs text-muted">
                Execute a permanent, non-recoverable cascading wipe of your profile, activities, people, and reflections with double confirmation in <Link href="/settings" className="text-brand hover:underline">Settings</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Contact & Inquiries */}
        <section className="space-y-2 border-t border-hairline/80 pt-6">
          <h2 className="font-serif text-xl font-medium text-foreground">5. Privacy Inquiries</h2>
          <p className="text-sm">
            For questions, data access requests, or security vulnerability disclosures regarding this Privacy Policy, please contact our data governance team at <span className="font-mono text-foreground">privacy@lifememory.app</span>.
          </p>
        </section>
      </div>
    </EditorialShell>
  );
}
