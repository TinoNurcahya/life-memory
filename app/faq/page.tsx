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
      subtitle="Transparent answers on how our asynchronous entity extraction works, why our reflections never hallucinate, and how your archive remains 100% private and portable."
      lastUpdated="November 2026"
      wide
    >
      <FaqAccordion />
    </EditorialShell>
  );
}
