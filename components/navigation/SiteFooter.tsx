"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Compass, MessageSquare } from "lucide-react";
import styles from "@/components/editorial/About.module.css";

interface BentoCardItem {
  id: string;
  href: string;
  label: string;
  imageSrc: string;
  videoSrc: string;
  variantClass: string;
}

const BENTO_CARDS: BentoCardItem[] = [
  {
    id: "morning-coffee",
    href: "/people?demo=jimmy",
    label: "Morning coffee",
    imageSrc: "/images/library/two-cups-table.webp",
    videoSrc: "/videos/library/cup-steam.mp4",
    variantClass: styles.bentoCardFeatured,
  },
  {
    id: "evening-train",
    href: "/places?demo=jimmy",
    label: "Evening train",
    imageSrc: "/images/library/morning-train-window.webp",
    videoSrc: "/videos/library/train-window.mp4",
    variantClass: styles.bentoCardTall,
  },
  {
    id: "shader-notes",
    href: "/topics?demo=jimmy",
    label: "Studio notes",
    imageSrc: "/images/library/notebook-hands.webp",
    videoSrc: "/videos/library/notebook-pages.mp4",
    variantClass: styles.bentoCardTopRight,
  },
  {
    id: "after-rain",
    href: "/forgot-this?demo=jimmy",
    label: "After rain",
    imageSrc: "/images/library/street-after-rain.webp",
    videoSrc: "/videos/library/street-after-rain.mp4",
    variantClass: styles.bentoCardBottomRight,
  },
];

function SequentialBentoGrid() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isInView, setIsInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const playingIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  // Observe whether the Bento grid is visible in the viewport
  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Play the currently active card's video and pause all others
  useEffect(() => {
    BENTO_CARDS.forEach((_, idx) => {
      const video = videoRefs.current[idx];
      if (!video) return;

      if (isInView && idx === playingIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [isInView, playingIndex]);

  // Fallback timer so videos rotate in sequence (0 -> 1 -> 2 -> 3 -> 0) even if a clip is long
  useEffect(() => {
    if (!isInView || hoveredIndex !== null) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % BENTO_CARDS.length);
    }, 5500);

    return () => window.clearTimeout(timer);
  }, [isInView, hoveredIndex, activeIndex]);

  const handleVideoEnded = (idx: number) => {
    if (hoveredIndex === idx) {
      // While hovered, keep playing the hovered video
      const video = videoRefs.current[idx];
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
      return;
    }

    if (idx === activeIndex) {
      setActiveIndex((prev) => (prev + 1) % BENTO_CARDS.length);
    }
  };

  return (
    <div ref={gridRef} className={styles.bentoGrid}>
      {BENTO_CARDS.map((item, idx) => {
        const isActive = isInView && idx === playingIndex;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-label={item.label}
            onMouseEnter={() => {
              setHoveredIndex(idx);
              setActiveIndex(idx);
            }}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => {
              setHoveredIndex(idx);
              setActiveIndex(idx);
            }}
            onBlur={() => setHoveredIndex(null)}
            className={`${styles.bentoCard} ${item.variantClass}`}
          >
            <img
              src={item.imageSrc}
              alt={item.label}
              loading="lazy"
              className={styles.bentoMedia}
            />
            <video
              ref={(el) => {
                videoRefs.current[idx] = el;
              }}
              src={item.videoSrc}
              poster={item.imageSrc}
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
              onEnded={() => handleVideoEnded(idx)}
              className={`${styles.bentoVideo} ${
                isActive ? styles.bentoVideoActive : ""
              }`}
            />
            <div className={styles.bentoScrim} aria-hidden="true" />

            <span className={styles.bentoMinimalLabel}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function SiteFooter({ className = "" }: { className?: string }) {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className={`${styles.editorialFooter} ${className}`}>
      <div className={styles.footerInner}>
        {/* 1. Minimal Pinterest / Editorial 4-Card Bento Collage (Sequential Video Playback) */}
        <SequentialBentoGrid />

        {/* 2. Concise 4-Column Directory */}
        <div className={styles.footerNavGrid}>
          {/* Col 01: Brand */}
          <div className={styles.footerCol}>
            <span className={styles.footerColIndex}>01 — Archive</span>
            <Link href="/" className={styles.footerBrandRow}>
              <span className={styles.brandMark}>LM</span>
              <span>Life Memory</span>
            </Link>
            <p className={styles.footerBio}>
              A quiet, private archive for the moments worth keeping.
            </p>
          </div>

          {/* Col 02: Product */}
          <div className={styles.footerCol}>
            <span className={styles.footerColIndex}>02 — Product</span>
            <ul className={styles.footerLinkList}>
              <li>
                <Link
                  href="/dashboard?demo=jimmy"
                  className={styles.footerLink}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/timeline?demo=jimmy"
                  className={styles.footerLink}
                >
                  Timeline
                </Link>
              </li>
              <li>
                <Link
                  href="/insights?demo=jimmy"
                  className={styles.footerLink}
                >
                  Insights
                </Link>
              </li>
              <li>
                <Link
                  href="/reflection?demo=jimmy"
                  className={styles.footerLink}
                >
                  Reflections
                </Link>
              </li>
              <li>
                <Link
                  href="/chat?demo=jimmy"
                  className={styles.footerLinkHighlight}
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ask Memory</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 03: Legal */}
          <div className={styles.footerCol}>
            <span className={styles.footerColIndex}>03 — Legal</span>
            <ul className={styles.footerLinkList}>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/faq" className={styles.footerLink}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className={styles.footerLink}>
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 04: Access */}
          <div className={styles.footerCol}>
            <span className={styles.footerColIndex}>04 — Access</span>
            <ul className={styles.footerLinkList}>
              <li>
                <Link href="/sitemap" className={styles.footerLink}>
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/login" className={styles.footerLink}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/register" className={styles.footerLink}>
                  Register
                </Link>
              </li>
              <li>
                <Link href="/settings" className={styles.footerLink}>
                  Settings
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard?demo=jimmy"
                  className={styles.footerLinkHighlight}
                >
                  <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Live Demo</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Giant Magazine Wordmark & Back to Top */}
        <div className={styles.footerWordmarkRow}>
          <Link href="/" className={styles.giantWordmark}>
            life memory
            <span className={styles.giantWordmarkAsterisk}>✳</span>
          </Link>

          <button
            type="button"
            onClick={scrollToTop}
            className={styles.backToTopBtn}
          >
            <span>© {new Date().getFullYear()} · Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
