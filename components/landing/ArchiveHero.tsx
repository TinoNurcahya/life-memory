"use client";

import Image from "next/image";
import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { RollingText } from "@/components/ui/RollingText";

gsap.registerPlugin(ScrollTrigger);

import { RedPushPin } from "@/components/ui/RedPushPin";

export type ArchiveHeroHandle = { reveal: () => void };

export function ArchiveHero({ ref }: { ref: Ref<ArchiveHeroHandle> }) {
  const root = useRef<HTMLElement>(null);
  const entrance = useRef<gsap.core.Timeline | null>(null);
  const introReady = useRef(false);
  const stringPathRef = useRef<SVGPathElement>(null);
  const knot1Ref = useRef<SVGCircleElement>(null);
  const knot2Ref = useRef<SVGCircleElement>(null);

  useImperativeHandle(ref, () => ({
    reveal() {
      introReady.current = true;
      entrance.current?.play();
    },
  }), []);

  // Prepare animation measurements and pin spacing while the intro is stationary.
  useLayoutEffect(() => {
    if (!root.current) return;

    const updateStringDOM = () => {
      const photoPin = root.current?.querySelector(".lm-detective-pin-photo");
      const fragPin = root.current?.querySelector(".lm-detective-pin-fragment");
      const stage = root.current?.querySelector(".lm-hero-stage");
      if (!photoPin || !fragPin || !stage || !stringPathRef.current) return;

      const sRect = stage.getBoundingClientRect();
      const pRect = photoPin.getBoundingClientRect();
      const fRect = fragPin.getBoundingClientRect();

      const x1 = Math.round(pRect.left + pRect.width / 2 - sRect.left);
      const y1 = Math.round(pRect.top + pRect.height * 0.45 - sRect.top);
      const x2 = Math.round(fRect.left + fRect.width / 2 - sRect.left);
      const y2 = Math.round(fRect.top + fRect.height * 0.45 - sRect.top);

      const dx = x1 - x2;
      const dy = y1 - y2;
      const distance = Math.hypot(dx, dy);

      // Natural gravitational sag (benang kendor di dunia nyata)
      const droop = Math.round(Math.max(28, Math.min(52, distance * 0.13)));

      const midX = Math.round((x1 + x2) / 2);
      const midY = Math.round((y1 + y2) / 2 + droop);

      stringPathRef.current.setAttribute("d", `M ${x2} ${y2} Q ${midX} ${midY} ${x1} ${y1}`);
      knot1Ref.current?.setAttribute("cx", String(x1));
      knot1Ref.current?.setAttribute("cy", String(y1));
      knot2Ref.current?.setAttribute("cx", String(x2));
      knot2Ref.current?.setAttribute("cy", String(y2));
    };

    updateStringDOM();
    const timer1 = setTimeout(updateStringDOM, 100);
    const timer2 = setTimeout(updateStringDOM, 350);

    const stageEl = root.current?.querySelector<HTMLElement>(".lm-hero-stage");
    let ro: ResizeObserver | null = null;
    if (stageEl && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateStringDOM());
      ro.observe(stageEl);
    }
    window.addEventListener("resize", updateStringDOM);
    window.visualViewport?.addEventListener("resize", updateStringDOM);

    const mm = gsap.matchMedia(root);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const heroTl = gsap.timeline({ paused: true });
      entrance.current = heroTl;
      heroTl.from(".lm-hero-line > span", {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
      });
      heroTl.from(
        ".lm-hero-enter",
        {
          opacity: 0,
          y: 16,
          duration: 0.75,
          stagger: 0.06,
          ease: "power2.out",
        },
        "<"
      );
      heroTl.from(
        ".lm-hero-overline > span:first-child",
        {
          opacity: 0,
          x: -28,
          duration: 0.85,
          ease: "power3.out",
        },
        "<0.1"
      );
      heroTl.from(
        ".lm-hero-overline > span:last-child",
        {
          opacity: 0,
          x: 20,
          duration: 0.85,
          ease: "power3.out",
        },
        "<"
      );
      heroTl.from(
        ".lm-hero-side",
        {
          opacity: 0,
          y: -24,
          rotation: 180,
          duration: 0.85,
          ease: "power3.out",
        },
        "<0.15"
      );
      if (introReady.current) heroTl.progress(1);
      return () => { entrance.current = null; };
    });
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const section = root.current!;
      const stage = section.querySelector<HTMLElement>(".lm-hero-stage")!;
      const frame = section.querySelector<HTMLElement>(".lm-hero-photo")!;
      const photo = frame.querySelector("img")!;
      const video = frame.querySelector("video")!;
      let disposed = false;
      let visible = false;
      let expanded = false;
      let requested = false;
      let failed = false;
      let fade: gsap.core.Tween | undefined;
      const shouldPlay = () => !disposed && visible && expanded && !document.hidden && !failed;
      const hideVideo = (resetToStart = false) => {
        fade?.kill();
        gsap.set(video, { opacity: 0 });
        video.pause();
        if (resetToStart) {
          try {
            if (video.currentTime !== 0) {
              video.currentTime = 0;
            }
          } catch {
            // Ignore if metadata is not yet loaded
          }
        }
      };
      const syncPlayback = () => {
        if (!shouldPlay()) {
          requested = false;
          hideVideo(!expanded || !visible);
          return;
        }
        if (requested) return;
        requested = true;
        void video.play().catch((error: unknown) => {
          if (disposed || !shouldPlay()) return;
          if (error instanceof DOMException && error.name === "AbortError") return;
          failed = true;
          requested = false;
          hideVideo(false);
        });
      };
      const onPlaying = () => {
        if (!shouldPlay()) { hideVideo(!expanded || !visible); return; }
        fade?.kill();
        fade = gsap.to(video, { opacity: 1, duration: 0.4, ease: "power1.inOut" });
      };
      const onError = () => { failed = true; syncPlayback(); };
      video.addEventListener("playing", onPlaying);
      video.addEventListener("error", onError);
      document.addEventListener("visibilitychange", syncPlayback);
      video.src = "/videos/cafe-rain.mp4";
      video.load();
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      });
      observer.observe(stage);
      const zoom = { value: 1.13 };
      // Allocate the final surface once; scroll only changes transforms.
      // Counter-scale the photograph so the changing frame never stretches it.
      gsap.set(frame, { top: 0, left: 0, right: "auto", width: "100%", height: "100%", transformOrigin: "50% 50%" });
      gsap.set(photo, { scaleX: 1, scaleY: 1 });
      const setPhotoX = gsap.quickSetter(photo, "scaleX");
      const setPhotoY = gsap.quickSetter(photo, "scaleY");
      const setVideoX = gsap.quickSetter(video, "scaleX");
      const setVideoY = gsap.quickSetter(video, "scaleY");
      const fitPhoto = () => {
        const sx = Number(gsap.getProperty(frame, "scaleX"));
        const sy = Number(gsap.getProperty(frame, "scaleY"));
        const cover = Math.max(sx, sy);
        setPhotoX(cover / sx * zoom.value);
        setPhotoY(cover / sy * zoom.value);
        setVideoX(cover / sx * zoom.value);
        setVideoY(cover / sy * zoom.value);
      };
      const timeline = gsap.timeline({
        onUpdate() {
          fitPhoto();
          const nextExpanded = this.time() >= 0.85;
          if (expanded !== nextExpanded) {
            expanded = nextExpanded;
            syncPlayback();
          }
        },
        scrollTrigger: {
          id: "archive-hero",
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.5}`,
          pin: stage,
          scrub: 0.7,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      });
      timeline
        .to(".lm-hero-copy", { y: -90, opacity: 0, duration: 0.38 }, 0)
        .fromTo(
          ".lm-hero-overline",
          { opacity: 1, y: 0 },
          { opacity: 0, y: -24, duration: 0.15, immediateRender: false },
          0
        )
        .to(".lm-hero-details", { opacity: 0, duration: 0.15 }, 0)
        .to(".lm-detective-pin-photo", { opacity: 0, duration: 0.15 }, 0)
        .to(".lm-detective-string-svg", { opacity: 0, duration: 0.15 }, 0)
        .fromTo(
          frame,
          { x: () => stage.clientWidth * 0.235, y: () => stage.clientHeight * 0.035, scaleX: 0.31, scaleY: 0.53, rotate: 5 },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0, duration: 0.8, ease: "power2.inOut" },
          0.1
        )
        .to(zoom, { value: 1, duration: 0.9, ease: "none" }, 0)
        .fromTo(".lm-hero-photo-caption", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.8)
        .to(".lm-hero-photo-caption", { opacity: 0, y: -10, duration: 0.15, ease: "power1.in" }, 1.35);
      fitPhoto();
      return () => {
        disposed = true;
        observer.disconnect();
        document.removeEventListener("visibilitychange", syncPlayback);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("error", onError);
        fade?.kill();
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.style.removeProperty("opacity");
        video.style.removeProperty("transform");
      };
    });
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      ro?.disconnect();
      window.removeEventListener("resize", updateStringDOM);
      window.visualViewport?.removeEventListener("resize", updateStringDOM);
      mm.revert();
    };
  }, []);
  return (
    <section id="hero" ref={root} className="lm-hero lm-paper" aria-labelledby="archive-title">
      <div className="lm-hero-stage">
        <div className="lm-hero-overline lm-meta"><span>A personal archive of ordinary things</span><span>Est. in the everyday</span></div>
        
        {/* Detective Board: Red String Overlay */}
        <svg
          className="lm-detective-string-svg"
          aria-hidden="true"
        >
          <defs>
            <filter id="detective-string-shadow" x="-20%" y="-20%" width="160%" height="160%">
              <feDropShadow dx="1" dy="2.5" stdDeviation="1.5" floodColor="#091b25" floodOpacity="0.4" />
            </filter>
          </defs>
          <g filter="url(#detective-string-shadow)">
            <path
              ref={stringPathRef}
              stroke="#dc2626"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>
          <circle ref={knot1Ref} r="3.5" stroke="#991b1b" strokeWidth="1.6" fill="none" />
          <circle ref={knot2Ref} r="3.5" stroke="#991b1b" strokeWidth="1.6" fill="none" />
        </svg>

        <div className="lm-hero-photo">
          <video className="lm-hero-video" muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />
          <Image src="/images/hero-memory.jpg" alt="Rain on a café window, a warm lamp, and a notebook beside a cup of coffee" fill loading="eager" fetchPriority="high" sizes="(max-width: 1023px) 85vw, 100vw" />
          <div className="lm-hero-photo-caption"><span className="lm-meta">A moment worth keeping</span><p>It was just<br /><em>another day.</em></p></div>
        </div>
        <div className="lm-hero-copy">
          <h1 id="archive-title"><span className="lm-hero-line"><span>The shape</span></span><span className="lm-hero-line lm-hero-line-second"><span>of <em>your life.</em></span></span></h1>
          <div className="lm-hero-bottom lm-hero-enter">
            <p>Somewhere between the coffee,<br />the conversations, and the rain.<br /><span>A life is taking shape.</span></p>
            <a href="#ordinary" className="lm-enter-link group"><RollingText text="Enter the archive" /><ArrowDown size={18} strokeWidth={1.3} /></a>
          </div>
        </div>
        <div className="lm-hero-details lm-meta">
          {/* Detective Board: Red Push Pin on Photo */}
          <RedPushPin className="lm-detective-pin-photo" />
          <span className="lm-hero-fragment">
            {/* Detective Board: Red Push Pin on Date Fragment */}
            <RedPushPin className="lm-detective-pin-fragment" />
            01 OCT 2026<br /><span>COFFEE / RAIN / HOME</span>
          </span>
          <span className="lm-hero-side">Small moments. A whole life.</span>
          <span className="lm-hero-edition">Life Memory <ArrowUpRight size={13} /></span>
        </div>
      </div>
    </section>
  );
}
