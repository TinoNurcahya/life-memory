import type { Metadata } from "next";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import { FaqAccordion } from "@/components/editorial/FaqAccordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) · Life Memory",
  description:
    "Everything you need to know about Life Memory. AI entity extraction, privacy guarantees, data export, and autobiographical journaling philosophy.",
};

export default function FaqPage() {
  return (
    <EditorialShell
      badge="Knowledge Base"
      title="Frequently Asked Questions"
      subtitle="Find transparent answers regarding how our Google Gemini AI pipeline functions, our zero-training privacy policy, and how to get the most out of your living archive."
      lastUpdated="October 2026"
    >
      <FaqAccordion />
    </EditorialShell>
  );
}
