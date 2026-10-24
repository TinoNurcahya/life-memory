"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollWordReveal } from "@/components/experience/ScrollWordReveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
import { RollingText } from "@/components/ui/RollingText";
import { PaperCurl } from "@/components/ui/PaperCurl";
import { RedPushPin } from "@/components/ui/RedPushPin";
import { PolaroidPhoto } from "@/components/ui/PolaroidPhoto";
import {
  CursorImageHoverList,
  type CursorHoverItem,
} from "@/components/experience/CursorImageHover";
import { NaturalTypewriter } from "@/components/experience/NaturalTypewriter";
import {
  ARCHIVE_CAFE_VISITS,
  ARCHIVE_FIRSTS,
  ARCHIVE_PERIOD,
  ARCHIVE_SAMPLE_ENTRY,
  ARCHIVE_STATS,
  archiveDate,
} from "@/lib/experience/archive-data";
import "./chapters.css";

const CLOSING_REFLECTIONS = [
  "Someday, when this scenery becomes a memory,\n" +
  "what would you like to remember?\n" +
  "I want to remember you.\n" +
  "*From now on, forever and ever.*",

  "いつか、この景色が思い出に変わるその時、\n" +
  "あなたは何を覚えていたいですか？ \n" +
  "私はあなたを覚えていたい。\n" +
  "*この先も、ずっと、ずっと。*",

  "Suatu hari nanti, ketika pemandangan ini telah berubah menjadi kenangan,\n" +
  "kira-kira apa yang ingin kamu ingat?\n" +
  "Kalau aku,\n" +
  "aku ingin mengingatmu.\n" +
  "*Mulai dari sekarang, selalu, selamanya.*",
];

function ArchivePhoto({ src, alt, className = "", sizes = "(max-width: 767px) 90vw, 45vw" }: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`lm-photo ${className}`} data-image-reveal>
      <div className="lm-photo-inner" data-parallax>
        <Image src={src} alt={alt} fill sizes={sizes} className="lm-photo-image" />
      </div>
    </div>
  );
}

function ChapterLabel({ children }: { children: React.ReactNode }) {
  return <p className="lm-kicker lm-chapter-label" data-fade>{children}</p>;
}

type OrbitLabel = {
  x: number;
  y: number;
  transform: string;
};

type Constellation = {
  primary: string;
  secondary: string;
  stars: readonly (readonly [number, number, number])[];
  minor: readonly (readonly [number, number, number])[];
  labels: {
    you: OrbitLabel;
    coffee: OrbitLabel;
    amy: OrbitLabel;
    learning: OrbitLabel;
  };
};

function getOrbitStyle(label: OrbitLabel): React.CSSProperties {
  return {
    left: `${(label.x / 520) * 100}%`,
    top: `${(label.y / 280) * 100}%`,
    transform: label.transform,
  };
}

const CONSTELLATIONS: readonly Constellation[] = [
  {
    primary: "M62 190 L130 102 L215 80 L316 132 L448 72 L384 216 L316 132 L62 190",
    secondary: "M130 102 L316 132 M215 80 L384 216 M448 72 L466 170 L384 216 M466 170 L316 132",
    stars: [[62, 190, 5], [215, 80, 6], [448, 72, 5], [384, 216, 5]],
    minor: [[130, 102, 2.5], [316, 132, 3], [466, 170, 2]],
    labels: {
      you: { x: 62, y: 190, transform: "translate(-30%, 14px)" },
      coffee: { x: 215, y: 80, transform: "translate(-50%, calc(-100% - 10px))" },
      amy: { x: 448, y: 72, transform: "translate(14px, -60%)" },
      learning: { x: 384, y: 216, transform: "translate(-45%, 16px)" },
    },
  },
  {
    primary: "M48 152 L142 64 L238 116 L336 62 L472 142 L390 224 L238 116 L142 236 L48 152",
    secondary: "M48 152 L238 116 M336 62 L390 224 M142 64 L142 236 L390 224 M472 142 L390 224 M238 116 L336 62",
    stars: [[48, 152, 5], [142, 64, 5], [336, 62, 6], [472, 142, 5]],
    minor: [[238, 116, 3], [390, 224, 2.5], [142, 236, 2]],
    labels: {
      you: { x: 48, y: 152, transform: "translate(-20%, 14px)" },
      coffee: { x: 336, y: 62, transform: "translate(-50%, calc(-100% - 10px))" },
      amy: { x: 142, y: 64, transform: "translate(-50%, calc(-100% - 10px))" },
      learning: { x: 472, y: 142, transform: "translate(-85%, 16px)" },
    },
  },
  {
    primary: "M72 216 L116 88 L224 48 L348 116 L458 204 L348 116 L224 246 L72 216",
    secondary: "M116 88 L348 116 M224 48 L458 204 M224 246 L348 116 M404 116 L348 116 M72 216 L224 246",
    stars: [[72, 216, 5], [224, 48, 6], [348, 116, 5], [458, 204, 5]],
    minor: [[116, 88, 2.5], [224, 246, 3], [404, 116, 2]],
    labels: {
      you: { x: 72, y: 216, transform: "translate(-30%, 14px)" },
      coffee: { x: 224, y: 48, transform: "translate(-50%, calc(-100% - 10px))" },
      amy: { x: 348, y: 116, transform: "translate(16px, -50%)" },
      learning: { x: 458, y: 204, transform: "translate(-70%, 16px)" },
    },
  },
] as const;

export function OrdinaryDays() {
  return (
    <section id="ordinary" className="lm-chapter lm-paper lm-ordinary" aria-labelledby="ordinary-title">
      <div className="lm-container">
        <ChapterLabel>THE BEAUTY IN BETWEEN</ChapterLabel>
        <div className="lm-ordinary-composition">
          <h2 id="ordinary-title" className="lm-title lm-ordinary-title" data-reveal>
            Some days<br />feel like<br /><em>nothing much.</em>
          </h2>
          <figure className="lm-ordinary-main">
            <ArchivePhoto src="/images/library/morning-kitchen.png" alt="A quiet kitchen table with one cup in the first morning light" />
            <figcaption className="lm-meta" data-fade><span>A TABLE. A COFFEE. A LITTLE TIME.</span><span>FIG. 01</span></figcaption>
          </figure>
          <figure className="lm-ordinary-detail">
            <ArchivePhoto src="/images/library/morning-train-window.png" alt="A rain-speckled train window overlooking a quiet morning landscape" sizes="(max-width: 767px) 42vw, 22vw" />
            <figcaption className="lm-meta" data-fade>THE LONG WAY HOME.</figcaption>
          </figure>
          <div className="lm-ordinary-note" data-fade>
            <span className="lm-handwritten" aria-hidden="true">Stay a little longer.</span>
            <p className="lm-copy">A conversation that ran late. The rain on the way home. The café you kept coming back to.</p>
            <p className="lm-copy">Small things, until you see them together.</p>
          </div>
        </div>
        <div className="lm-ordinary-afterword">
          <span className="lm-meta" data-fade>NOTHING EXTRAORDINARY.<br />EVERYTHING WORTH KEEPING.</span>
          <ScrollWordReveal className="lm-ordinary-quote">
            The days pass.<br /><em>They don’t have to disappear.</em>
          </ScrollWordReveal>
        </div>
      </div>
    </section>
  );
}

export function LifeTakingShape() {
  const firstCoffee = ARCHIVE_CAFE_VISITS[0];
  const [constellation, setConstellation] = useState(CONSTELLATIONS[0]);
  const orbitRef = useRef<HTMLDivElement>(null);
  const primaryGlowRef = useRef<SVGPathElement>(null);
  const secondaryGlowRef = useRef<SVGPathElement>(null);
  const [activeWords, setActiveWords] = useState<{ [key: string]: boolean }>({});
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setConstellation(CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)]);
  }, []);

  useEffect(() => {
    const el = orbitRef.current;
    if (!el) return;

    // Base lines draw entrance
    const basePaths = el.querySelectorAll<SVGPathElement>(".lm-orbit-primary-base, .lm-orbit-secondary");
    if (reducedMotion) {
      basePaths.forEach((path) => {
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "none";
      });
      return;
    }

    let loopTimer: NodeJS.Timeout | null = null;
    let pulseTl: gsap.core.Timeline | null = null;

    const ctx = gsap.context(() => {
      // 1. Entrance draw of base constellation lines
      basePaths.forEach((path) => {
        const length = path.getTotalLength();
        if (!length) return;
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onComplete: () => {
              gsap.set(path, { clearProps: "strokeDasharray,strokeDashoffset" });
            },
          }
        );
      });

      // 2. Setup Glowing Beam Pulse Timeline starting from YOU
      const primaryGlow = primaryGlowRef.current;
      const secondaryGlow = secondaryGlowRef.current;
      if (!primaryGlow) return;

      const L1 = primaryGlow.getTotalLength();
      const L2 = secondaryGlow ? secondaryGlow.getTotalLength() : 0;
      const B1 = Math.max(75, L1 * 0.22);
      const B2 = Math.max(50, L2 * 0.25);

      primaryGlow.style.strokeDasharray = `${B1} ${L1 * 2}`;
      if (secondaryGlow) {
        secondaryGlow.style.strokeDasharray = `${B2} ${L2 * 2}`;
      }

      // Helper to compute distance ratio along primary path to a star
      const getStarRatio = (cx: number, cy: number): number => {
        let bestDist = 0;
        let minDiff = Infinity;
        const steps = 80;
        for (let i = 0; i <= steps; i++) {
          const d = (i / steps) * L1;
          const pt = primaryGlow.getPointAtLength(d);
          const diff = Math.hypot(pt.x - cx, pt.y - cy);
          if (diff < minDiff) {
            minDiff = diff;
            bestDist = d;
          }
        }
        return bestDist / L1;
      };

      const getStarKey = (cx: number, cy: number): string | null => {
        const { labels } = constellation;
        if (labels.you.x === cx && labels.you.y === cy) return "you";
        if (labels.coffee.x === cx && labels.coffee.y === cy) return "coffee";
        if (labels.amy.x === cx && labels.amy.y === cy) return "amy";
        if (labels.learning.x === cx && labels.learning.y === cy) return "learning";
        return null;
      };

      const starPoints = constellation.stars.map(([cx, cy], i) => ({
        cx,
        cy,
        ratio: getStarRatio(cx, cy),
        key: getStarKey(cx, cy),
        index: i,
      }));

      // Sort star arrivals by ratio along path
      starPoints.sort((a, b) => a.ratio - b.ratio);

      const durationPrimary = 2.6;

      pulseTl = gsap.timeline({
        paused: true,
        onComplete: () => {
          scheduleLoop();
        },
      });

      // Reset beam positions at start
      pulseTl.set(primaryGlow, { strokeDashoffset: B1, opacity: 0 });
      if (secondaryGlow) {
        pulseTl.set(secondaryGlow, { strokeDashoffset: B2, opacity: 0 });
      }

      // Primary beam travels from YOU
      pulseTl.to(primaryGlow, { opacity: 1, duration: 0.2 }, 0);
      pulseTl.to(
        primaryGlow,
        {
          strokeDashoffset: -L1,
          duration: durationPrimary,
          ease: "power1.inOut",
        },
        0
      );

      // Star blooms & label highlights triggered at exact beam arrival
      starPoints.forEach(({ ratio, key, index }) => {
        const arrivalTime = Math.max(0, Math.min(durationPrimary - 0.2, ratio * durationPrimary));
        const bloomEl = el.querySelector<SVGCircleElement>(`.lm-orbit-bloom-${index}`);
        const starEl = el.querySelector<SVGCircleElement>(`.lm-orbit-star-${index}`);

        if (bloomEl) {
          pulseTl?.fromTo(
            bloomEl,
            { opacity: 0.95, scale: 0.35, transformOrigin: "center center" },
            { opacity: 0, scale: 1.5, duration: 0.75, ease: "power2.out" },
            arrivalTime
          );
        }

        if (starEl) {
          pulseTl?.call(
            () => {
              starEl.classList.add("is-lit");
            },
            undefined,
            arrivalTime
          );
          pulseTl?.call(
            () => {
              starEl.classList.remove("is-lit");
            },
            undefined,
            arrivalTime + 0.85
          );
        }

        if (key) {
          pulseTl?.call(
            () => setActiveWords((prev) => ({ ...prev, [key]: true })),
            undefined,
            arrivalTime
          );
          pulseTl?.call(
            () => setActiveWords((prev) => ({ ...prev, [key]: false })),
            undefined,
            arrivalTime + 0.85
          );
        }
      });

      // Secondary beam pulses across diagonals as primary reaches middle (~0.8s)
      if (secondaryGlow && L2 > 0) {
        const secStart = 0.8;
        pulseTl.to(secondaryGlow, { opacity: 0.85, duration: 0.25 }, secStart);
        pulseTl.to(
          secondaryGlow,
          {
            strokeDashoffset: -L2,
            duration: 1.6,
            ease: "power1.inOut",
          },
          secStart
        );
        pulseTl.to(secondaryGlow, { opacity: 0, duration: 0.35 }, secStart + 1.3);
      }

      // Primary glow fades at end of stroke
      pulseTl.to(primaryGlow, { opacity: 0, duration: 0.35 }, durationPrimary - 0.2);

      // Trigger first pulse once in view after initial base lines draw
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => {
          setTimeout(() => {
            pulseTl?.restart();
          }, 1100);
        },
      });

      const scheduleLoop = () => {
        if (loopTimer) clearTimeout(loopTimer);
        loopTimer = setTimeout(() => {
          pulseTl?.restart();
        }, 5500);
      };

      // Interactive hover triggers pulse
      const onMouseEnter = () => {
        if (pulseTl && !pulseTl.isActive()) {
          if (loopTimer) clearTimeout(loopTimer);
          pulseTl.restart();
        }
      };

      el.addEventListener("mouseenter", onMouseEnter);

      return () => {
        if (loopTimer) clearTimeout(loopTimer);
        el.removeEventListener("mouseenter", onMouseEnter);
      };
    }, el);

    return () => {
      if (loopTimer) clearTimeout(loopTimer);
      ctx.revert();
    };
  }, [constellation, reducedMotion]);

  return (
    <section id="patterns" className="lm-chapter lm-ink lm-patterns" aria-labelledby="patterns-title" data-memory-field>
      <div className="lm-container">
        <ChapterLabel>THE THREADS BETWEEN DAYS</ChapterLabel>
        <div className="lm-patterns-heading">
          <h2 id="patterns-title" className="lm-title" data-reveal>A life,<br /><em>taking shape.</em></h2>
          <p className="lm-copy" data-fade>Look a little closer. The separate moments start to tell a story of their own.</p>
        </div>
        <div className="lm-patterns-body">
          <div className="lm-return-number" data-fade>
            <p className="lm-meta">ONE PLACE. A FAMILIAR FEELING.</p>
            <span className="lm-huge-number" data-count={ARCHIVE_STATS.cafeVisits}>{ARCHIVE_STATS.cafeVisits}</span>
            <p className="lm-return-caption">visits to the <em>same café.</em></p>
            <p className="lm-meta">THE NEIGHBORHOOD CAFÉ / {ARCHIVE_PERIOD}</p>
          </div>
          <div className="lm-pattern-map" data-fade>
            <div className="lm-pattern-map-label"><span className="lm-meta">A SMALL CONSTELLATION</span><span aria-hidden="true">✳</span></div>
            <div ref={orbitRef} className="lm-pattern-orbit" aria-hidden="true">
              <svg viewBox="0 0 520 280" fill="none">
                <defs>
                  <filter id="lm-constellation-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id="lm-star-bloom-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="35%" stopColor="#fff5d0" stopOpacity="0.85" />
                    <stop offset="70%" stopColor="#ffda85" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffc04d" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Base constellation lines */}
                <path className="lm-orbit-primary-base" d={constellation.primary} />
                <path className="lm-orbit-secondary" d={constellation.secondary} />

                {/* Glowing traveling pulse paths */}
                <path ref={primaryGlowRef} className="lm-orbit-glow-path" d={constellation.primary} />
                <path ref={secondaryGlowRef} className="lm-orbit-glow-secondary" d={constellation.secondary} />

                {/* Minor connector stars */}
                {constellation.minor.map(([cx, cy, r]) => (
                  <circle className="lm-orbit-minor" key={`minor-${cx}-${cy}`} cx={cx} cy={cy} r={r} />
                ))}

                {/* Major stars and bloom ripples */}
                {constellation.stars.map(([cx, cy, r], i) => (
                  <g key={`star-group-${cx}-${cy}`}>
                    <circle
                      className={`lm-orbit-bloom lm-orbit-bloom-${i}`}
                      cx={cx}
                      cy={cy}
                      r={r * 2.8}
                    />
                    <circle
                      className={`lm-orbit-star lm-orbit-star-${i}`}
                      cx={cx}
                      cy={cy}
                      r={r}
                    />
                  </g>
                ))}
              </svg>
              <div className="lm-orbit-stage">
                <span className={`lm-orbit-word lm-orbit-you ${activeWords.you ? "is-active-glow" : ""}`} style={getOrbitStyle(constellation.labels.you)}>YOU</span>
                <span className={`lm-orbit-word lm-orbit-coffee ${activeWords.coffee ? "is-active-glow" : ""}`} style={getOrbitStyle(constellation.labels.coffee)}>Coffee</span>
                <span className={`lm-orbit-word lm-orbit-lena ${activeWords.amy ? "is-active-glow" : ""}`} style={getOrbitStyle(constellation.labels.amy)}>Amy</span>
                <span className={`lm-orbit-word lm-orbit-learning ${activeWords.learning ? "is-active-glow" : ""}`} style={getOrbitStyle(constellation.labels.learning)}>A little learning</span>
              </div>
            </div>
            <ol className="lm-visit-line" aria-label="Café visits in the illustrative archive">
              {ARCHIVE_CAFE_VISITS.map((entry) => <li key={entry.id}><span aria-hidden="true" /><time dateTime={entry.date}>{archiveDate(entry.date)}</time></li>)}
            </ol>
            <p className="lm-copy lm-pattern-map-caption">The same table. Different conversations.<br />A place slowly becoming part of your life.</p>
          </div>
        </div>
        <dl className="lm-sample-statistics" data-fade>
          <div><dt>moments kept</dt><dd data-count={ARCHIVE_STATS.moments}>{ARCHIVE_STATS.moments}</dd></div>
          <div><dt>places in the story</dt><dd data-count={ARCHIVE_STATS.places}>{ARCHIVE_STATS.places}</dd></div>
          <div><dt>familiar names</dt><dd data-count={ARCHIVE_STATS.people}>{ARCHIVE_STATS.people}</dd></div>
        </dl>
        <div className="lm-then-now">
          <div data-fade><p className="lm-meta">THEN / {archiveDate(firstCoffee.date)}</p><p>Coffee, <em>alone.</em></p></div>
          <span className="lm-then-arrow" aria-hidden="true" data-fade>↗</span>
          <div data-fade><p className="lm-meta">A LITTLE LATER / {archiveDate(ARCHIVE_SAMPLE_ENTRY.date)}</p><p>A table <em>for two.</em></p></div>
        </div>
        <p className="lm-meta lm-sample-disclosure" data-fade>ILLUSTRATIVE ARCHIVE · {ARCHIVE_PERIOD} · COUNTS FROM {ARCHIVE_STATS.moments} FICTIONAL ENTRIES</p>
      </div>
    </section>
  );
}

export function FirstTimes() {
  const reducedMotion = useReducedMotion();
  return (
    <section id="firsts" className="lm-chapter lm-paper lm-firsts" aria-labelledby="firsts-title">
      <div className="lm-container">
        <ChapterLabel>EVERY STORY STARTS SOMEWHERE</ChapterLabel>
        <div className="lm-firsts-heading">
          <h2 id="firsts-title" className="lm-title" data-reveal>There was<br />a <em>first time.</em></h2>
          <p className="lm-copy" data-fade>You didn’t know it was the beginning.<br />You were just living it.</p>
        </div>
        <div className="lm-firsts-gallery">
          {ARCHIVE_FIRSTS.map((entry, index) => (
            <div className="lm-first-item" key={entry.id} data-fade>
              <motion.figure
                className="lm-first-figure"
                whileHover={reducedMotion ? undefined : { y: -10, rotate: index === 1 ? 1 : -1 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
              >
                <div className="lm-first-image-wrap">
                  <ArchivePhoto src={entry.first.image} alt={entry.first.alt} sizes="(max-width: 767px) 90vw, 35vw" />
                </div>
                <figcaption>
                  <time className="lm-meta" dateTime={entry.date}>{archiveDate(entry.date, true)}</time>
                  <h3>{entry.first.title}</h3>
                  <p className="lm-copy">{entry.first.caption}</p>
                </figcaption>
              </motion.figure>
            </div>
          ))}
        </div>
        <div className="lm-firsts-bottom" data-fade><span className="lm-meta">{String(ARCHIVE_STATS.firsts).padStart(2, "0")} BEGINNINGS IN THIS SAMPLE</span><p>One day, the ordinary becomes <em>the first.</em></p></div>
      </div>
    </section>
  );
}

const REDISCOVERY_FRAGMENTS: CursorHoverItem[] = [
  {
    id: "retrieved-01",
    title: "Rain on the window with Amy",
    subtitle: "Waited forty minutes for the shower to pass over the tram line.",
    date: "OCT 03",
    highlightKeyword: "Rain",
    image: "/images/library/morning-train-window.webp",
    alt: "Rain on the train window over a morning landscape",
  },
  {
    id: "retrieved-02",
    title: "The table by the kitchen door",
    subtitle: "First cup alone while the kettle was still humming.",
    date: "OCT 01",
    highlightKeyword: "kitchen door",
    image: "/images/library/morning-kitchen.webp",
    alt: "Morning kitchen in soft natural light",
  },
  {
    id: "retrieved-03",
    title: "Notes scribbled in the margin",
    subtitle: "Sketched the rough outline of an idea on unlined paper.",
    date: "OCT 05",
    highlightKeyword: "Notes",
    image: "/images/library/notebook-hands.webp",
    alt: "Hands writing in a quiet notebook",
  },
  {
    id: "retrieved-04",
    title: "Two cups on a sunlit table",
    subtitle: "An unplanned afternoon talk that turned into evening.",
    date: "OCT 07",
    highlightKeyword: "Two cups",
    image: "/images/library/two-cups-table.webp",
    alt: "Two coffee cups in warm afternoon light",
  },
  {
    id: "retrieved-05",
    title: "The wet street after dark",
    subtitle: "Walking the long way home past the glowing laundromat.",
    date: "OCT 08",
    highlightKeyword: "wet street",
    image: "/images/library/street-after-rain.webp",
    alt: "Street reflections after rain",
  },
];

export function Rediscovery() {
  return (
    <section id="rediscovery" className="lm-chapter lm-ink lm-rediscovery" aria-labelledby="rediscovery-title" data-memory-field>
      <div className="lm-container">
        <ChapterLabel>SOMETHING COMES BACK TO YOU</ChapterLabel>
        <div className="lm-rediscovery-heading">
          <span className="lm-meta" data-fade>RETRIEVED FROM THE LITTLE THINGS</span>
          <h2 id="rediscovery-title" className="lm-title" data-reveal>You probably<br /><em>forgot this.</em></h2>
        </div>
      </div>
      <div className="lm-rediscovery-scene">
        <ArchivePhoto src="/images/memory-dream-haze.jpg" alt="A soft, half-remembered room in the afternoon haze" sizes="100vw" />
        <div className="lm-retrieved-note-track">
          <div className="lm-retrieved-note" data-note-parallax data-note-curl>
            <RedPushPin className="lm-retrieved-note-pin" />
            <div className="lm-retrieved-note-paper">
              <div className="lm-meta">
                <time dateTime={ARCHIVE_SAMPLE_ENTRY.date}>{archiveDate(ARCHIVE_SAMPLE_ENTRY.date, true)}</time>
                <span>{ARCHIVE_SAMPLE_ENTRY.time}</span>
              </div>
              <p>“{ARCHIVE_SAMPLE_ENTRY.text}”</p>
              <div className="lm-meta lm-retrieved-source">
                <span>FROM AN ORIGINAL SAMPLE NOTE</span>
                <span aria-hidden="true">↗</span>
              </div>
            </div>
            <PaperCurl />
          </div>
        </div>
        <p className="lm-rediscovery-photo-caption lm-meta" data-fade>A MEMORY DOESN’T HAVE TO BE BIG TO MATTER.</p>
      </div>

      {/* Retrieved Moments List with Velocity Skew Cursor Follow */}
      <div className="lm-container my-16 sm:my-24">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4" data-fade>
          <div>
            <span className="lm-meta text-white/50">
              EXPLORE STORED MOMENTS · VELOCITY SENSITIVE
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white/95 font-light mt-1">
              Fragments retrieved from the timeline
            </h3>
          </div>
          <span className="font-mono text-[11px] text-white/40 uppercase">
            [HOVER TO RECONSTRUCT]
          </span>
        </div>
        <CursorImageHoverList items={REDISCOVERY_FRAGMENTS} variant="ink" />
      </div>

      <div className="lm-container lm-reflection">
        <p className="lm-meta" data-fade>{ARCHIVE_PERIOD}<br />AN ILLUSTRATIVE REFLECTION</p>
        <blockquote className="lm-reflection-quote">
          <NaturalTypewriter
            text={"“Maybe it wasn’t just the coffee.\nMaybe it was having\n*somewhere to return to.*”"}
            cursorClassName="text-amber-200"
          />
        </blockquote>
        <div className="lm-reflection-foot" data-fade><span className="lm-meta">{ARCHIVE_STATS.cafeVisits} VISITS. ONE FAMILIAR PLACE.</span><p className="lm-copy">The notes hold the details.<br />You decide what they mean.</p></div>
      </div>
    </section>
  );
}

export function ArchiveFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) {
        setInView(true);
      } else if (rect.top > window.innerHeight * 0.8) {
        setInView(false);
      }
    };

    checkVisibility();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.boundingClientRect.top <= window.innerHeight * 0.5) {
            setInView(true);
          } else if (entry.boundingClientRect.top > window.innerHeight * 0.8) {
            setInView(false);
          }
        }
      },
      { threshold: [0.2, 0.4, 0.6] }
    );

    observer.observe(el);
    window.addEventListener("scroll", checkVisibility, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", checkVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} className="lm-footer-reveal-container">
      <div className="lm-footer-reveal-track">
        <div className="lm-footer-reveal-sticky">
          <footer
            id="closing"
            className="lm-chapter lm-paper lm-closing"
            aria-labelledby="closing-title"
          >
            <div className="lm-container">
              <motion.p
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="lm-kicker lm-chapter-label"
              >
                THE REST IS STILL UNWRITTEN
              </motion.p>
              <div className="lm-closing-composition">
                <div className="lm-closing-words">
                  <h2 id="closing-title" className="lm-title">
                    <span className="block overflow-hidden pb-2">
                      <motion.span
                        className="inline-block"
                        initial={reducedMotion ? false : { y: "130%" }}
                        animate={inView ? { y: "0%" } : { y: "130%" }}
                        transition={{ duration: 1.15, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
                      >
                        Keep what
                      </motion.span>
                    </span>
                    <span className="block overflow-hidden pb-2">
                      <motion.span
                        className="inline-block"
                        initial={reducedMotion ? false : { y: "130%" }}
                        animate={inView ? { y: "0%" } : { y: "130%" }}
                        transition={{ duration: 1.15, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <em>matters.</em>
                      </motion.span>
                    </span>
                  </h2>
                  <motion.blockquote
                    className="lm-closing-quote"
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <NaturalTypewriter
                      texts={CLOSING_REFLECTIONS}
                      loop={true}
                      pauseDuration={3800}
                      start={inView}
                      delay={400}
                      speedMultiplier={1.35}
                      deleteSpeedMultiplier={1.25}
                      wordPauseDuration={220}
                      punctuationPauseDuration={2000}
                      questionPauseDuration={2000}
                      cursorClassName="text-[var(--archive-accent)]"
                    />
                  </motion.blockquote>
                  <motion.div
                    className="lm-closing-actions"
                    initial={reducedMotion ? false : { opacity: 0, y: 22 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                    transition={{ duration: 0.9, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link href="/dashboard?demo=jimmy" className="lm-closing-primary group">
                      <RollingText text="Explore the demo" /> <span aria-hidden="true">↗</span>
                    </Link>
                    <Link href="/register" className="lm-text-link group">
                      <RollingText text="Start your archive" /> <span aria-hidden="true">↗</span>
                    </Link>
                  </motion.div>
                </div>
                <motion.div
                  className="lm-closing-photo-wrap"
                  initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
                  animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
                  transition={{ duration: 1, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PolaroidPhoto
                    src="/images/memory-autumn-park.jpg"
                    alt="Two empty chairs in the golden light beneath an autumn tree"
                    caption="There is more to come."
                    className="lm-closing-photo"
                  />
                </motion.div>
              </div>
              <div className="lm-colophon">
                <a href="#hero" className="lm-colophon-brand" aria-label="Life Memory, back to the beginning">
                  life memory<span aria-hidden="true">✳</span>
                </a>
                <p className="lm-meta">AN ARCHIVE OF BEING ALIVE.</p>
                <a href="#hero" className="lm-text-link group">
                  <RollingText text="Back to the beginning" /> <span aria-hidden="true">↑</span>
                </a>
              </div>
              <p className="lm-closing-disclosure">
                A fictional archive, told through sample notes and illustrative photography.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
