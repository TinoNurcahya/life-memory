"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "@/lib/experience/theme-context";
import { IntroLoader } from "@/components/experience/IntroLoader";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { ArchiveMotion } from "@/components/landing/ArchiveMotion";
import { ArchiveNavigation } from "@/components/landing/ArchiveNavigation";
import { ArchiveHero, type ArchiveHeroHandle } from "@/components/landing/ArchiveHero";
import { ArchiveReconstruction } from "@/components/landing/ArchiveReconstruction";
import { OrdinaryDays, LifeTakingShape, FirstTimes, Rediscovery, ArchiveFooter } from "@/components/landing/ArchiveChapters";
import "@/components/landing/archive.css";

const MemoryField = dynamic(() => import("@/components/experience/MemoryField").then((mod) => mod.MemoryField), { ssr: false });

export default function Home() {
  const heroRef = useRef<ArchiveHeroHandle>(null);
  const [introDone, setIntroDone] = useState(false);
  const completeIntro = useCallback(() => {
    heroRef.current?.reveal();
    setIntroDone(true);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <ArchiveMotion>
          <a className="lm-skip" href="#ordinary">Skip to the story</a>
          <IntroLoader onComplete={completeIntro} />
          <MemoryField />
          <ArchiveNavigation introReady={introDone} />
          <div className="lm-grain" aria-hidden="true" />
          <SmoothScroll>
            <main id="archive-main">
              <ArchiveHero ref={heroRef} />
              <OrdinaryDays />
              <ArchiveReconstruction />
              <LifeTakingShape />
              <FirstTimes />
              <Rediscovery />
              <ArchiveFooter />
            </main>
          </SmoothScroll>
        </ArchiveMotion>
      </ThemeProvider>
    </MotionConfig>
  );
}
