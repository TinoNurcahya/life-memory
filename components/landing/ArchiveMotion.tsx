"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** All enhancements begin with readable HTML and are scoped to this route. */
export function ArchiveMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const reloadPosition = useRef<{ x: number; y: number } | null | undefined>(undefined);
  useLayoutEffect(() => {
    if (!root.current) return;
    const mm = gsap.matchMedia(root);
    let disposed = false;
    const scrollKey = "lm-archive-scroll";
    const currentUrl = () => location.pathname + location.search + location.hash;
    const previousScrollRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    ScrollTrigger.clearScrollMemory();

    if (reloadPosition.current === undefined) {
      reloadPosition.current = null;
      try {
        const saved = sessionStorage.getItem(scrollKey);
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if (saved && navigation?.type === "reload") {
          const position = JSON.parse(saved);
          if (position.url === currentUrl() && Number.isFinite(position.x) && Number.isFinite(position.y)) {
            reloadPosition.current = { x: Math.max(0, position.x), y: Math.max(0, position.y) };
          }
        }
      } catch { /* Keep native scroll restoration when session storage is unavailable. */ }
    }

    let restorePosition = reloadPosition.current;
    let isRestoring = restorePosition !== null;
    let saveFrame = 0;

    const savePosition = () => {
      if (isRestoring) return;
      try {
        sessionStorage.setItem(scrollKey, JSON.stringify({ url: currentUrl(), x: window.scrollX, y: window.scrollY }));
      } catch { /* Storage restrictions must not interrupt navigation. */ }
    };

    const scheduleSavePosition = () => {
      if (isRestoring || saveFrame) return;
      saveFrame = requestAnimationFrame(() => {
        saveFrame = 0;
        savePosition();
      });
    };

    const endRestore = () => {
      if (!isRestoring) return;
      isRestoring = false;
      restorePosition = reloadPosition.current = null;
    };

    window.addEventListener("pagehide", savePosition);
    window.addEventListener("scroll", scheduleSavePosition, { passive: true });
    window.addEventListener("wheel", endRestore, { passive: true });
    window.addEventListener("touchstart", endRestore, { passive: true });
    window.addEventListener("pointerdown", endRestore, { passive: true });
    window.addEventListener("keydown", endRestore);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const scope = root.current!;
      const splits: SplitText[] = [];
      const counters: Array<() => void> = [];
      const curlCleanups: Array<() => void> = [];
      scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        splits.push(SplitText.create(element, {
          type: "lines", mask: "lines", autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 105, duration: 1.05, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          }),
        }));
      });
      scope.querySelectorAll<HTMLElement>("[data-fade]").forEach((element) => {
        gsap.from(element, { y: 24, opacity: 0, duration: 0.85, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 93%", once: true } });
      });
      scope.querySelectorAll<HTMLElement>("[data-image-reveal]").forEach((element) => {
        gsap.fromTo(element, { clipPath: "inset(12% 8% 12% 8%)" }, {
          clipPath: "inset(0% 0% 0% 0%)", ease: "none",
          scrollTrigger: { trigger: element, start: "top 95%", end: "center 45%", scrub: 0.7 },
        });
      });
      scope.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => {
        gsap.fromTo(element, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } });
      });
      scope.querySelectorAll<HTMLElement>("[data-note-parallax]").forEach((element) => {
        const track = element.closest(".lm-retrieved-note-track") || element.parentElement;
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        const startY = isMobile ? 20 : 45;
        const endY = isMobile ? -20 : -45;
        const startRot = isMobile ? 0.8 : 2.2;
        const endRot = isMobile ? -0.8 : -2.5;

        gsap.from(element, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: track, start: "top 95%", once: true },
        });

        gsap.fromTo(
          element,
          { y: startY, rotate: startRot },
          {
            y: endY,
            rotate: endRot,
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          }
        );
      });
      scope.querySelectorAll<HTMLElement>("[data-note-curl]").forEach((noteEl) => {
        const curlSvg = noteEl.querySelector<SVGElement>(".lm-retrieved-note-curl");
        const track = noteEl.closest(".lm-retrieved-note-track") || noteEl.parentElement;

        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

        // On mobile / touch screens, disable curl animation completely so note stays fully flat and readable
        if (!isDesktop) {
          noteEl.style.setProperty("--curl-cut", "0%");
          if (curlSvg) {
            curlSvg.style.display = "none";
          }
          return;
        }

        // Initialize flat
        noteEl.style.setProperty("--curl-cut", "0%");
        if (curlSvg) {
          curlSvg.style.transform = "scale(0)";
          curlSvg.style.opacity = "0";
        }

        const curlProxy = { progress: 0 };

        // ScrollTrigger: smooth organic roll-in reaching center (~52%) once in view
        const anim = gsap.to(curlProxy, {
          progress: 1,
          duration: 1.4,
          ease: "power2.out",
          delay: 0.25,
          scrollTrigger: {
            trigger: track,
            start: "top 82%",
            once: true,
          },
          onUpdate: () => {
            const cutVal = curlProxy.progress * 52;
            noteEl.style.setProperty("--curl-cut", `${cutVal}%`);
            if (curlSvg) {
              curlSvg.style.transform = `scale(${curlProxy.progress})`;
              curlSvg.style.opacity = `${Math.min(1, curlProxy.progress * 1.5)}`;
            }
          },
        });

        // Interactive hover: open (uncurl) on hover, restore on leave
        let isHovered = false;

        const onPointerEnter = () => {
          if (isHovered) return;
          isHovered = true;
          gsap.to(curlProxy, {
            progress: 0,
            duration: 0.65,
            ease: "power2.out",
            overwrite: "auto",
            onUpdate: () => {
              const cutVal = curlProxy.progress * 52;
              noteEl.style.setProperty("--curl-cut", `${cutVal}%`);
              if (curlSvg) {
                curlSvg.style.transform = `scale(${curlProxy.progress})`;
                curlSvg.style.opacity = `${Math.min(1, curlProxy.progress * 1.5)}`;
              }
            },
          });
        };

        const onPointerLeave = () => {
          if (!isHovered) return;
          isHovered = false;
          gsap.to(curlProxy, {
            progress: 1.0,
            duration: 0.75,
            ease: "power2.out",
            overwrite: "auto",
            onUpdate: () => {
              const cutVal = curlProxy.progress * 52;
              noteEl.style.setProperty("--curl-cut", `${cutVal}%`);
              if (curlSvg) {
                curlSvg.style.transform = `scale(${curlProxy.progress})`;
                curlSvg.style.opacity = `${Math.min(1, curlProxy.progress * 1.5)}`;
              }
            },
          });
        };

        const onClick = () => {
          // On touch devices where hover is simulated, toggle open / close
          if (curlProxy.progress > 0.4) {
            onPointerEnter();
          } else {
            onPointerLeave();
          }
        };

        noteEl.addEventListener("mouseenter", onPointerEnter);
        noteEl.addEventListener("mouseleave", onPointerLeave);
        noteEl.addEventListener("pointerenter", onPointerEnter);
        noteEl.addEventListener("pointerleave", onPointerLeave);
        noteEl.addEventListener("click", onClick);

        curlCleanups.push(() => {
          anim.kill();
          noteEl.removeEventListener("mouseenter", onPointerEnter);
          noteEl.removeEventListener("mouseleave", onPointerLeave);
          noteEl.removeEventListener("pointerenter", onPointerEnter);
          noteEl.removeEventListener("pointerleave", onPointerLeave);
          noteEl.removeEventListener("click", onClick);
        });
      });
      scope.querySelectorAll<HTMLElement>("[data-count]").forEach((element) => {
        const target = Number(element.dataset.count || element.textContent);
        if (!Number.isFinite(target)) return;
        const counter = { value: 0 };
        const original = element.textContent;
        gsap.to(counter, {
          value: target, duration: 1.4, ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 95%", once: true },
          onUpdate: () => { element.textContent = String(Math.round(counter.value)).padStart(2, "0"); },
        });
        counters.push(() => { element.textContent = original; });
      });
      scope.querySelectorAll<SVGPathElement>("[data-draw]").forEach((element) => {
        const length = element.getTotalLength();
        gsap.fromTo(element, { strokeDasharray: length, strokeDashoffset: length }, {
          strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut",
          scrollTrigger: { trigger: element, start: "top 90%", once: true },
          onComplete: () => {
            gsap.set(element, { clearProps: "strokeDasharray,strokeDashoffset" });
          },
        });
      });
      return () => {
        splits.forEach((split) => split.revert());
        counters.forEach((restore) => restore());
        curlCleanups.forEach((cleanup) => cleanup());
      };
    });

    const refresh = () => {
      if (disposed) return;
      if (restorePosition) {
        window.scrollTo({ left: restorePosition.x, top: restorePosition.y, behavior: "instant" });
      }
      ScrollTrigger.refresh();
      if (restorePosition) {
        window.scrollTo({ left: restorePosition.x, top: restorePosition.y, behavior: "instant" });
        ScrollTrigger.update();
        if (document.readyState === "complete" && document.fonts.status === "loaded") {
          setTimeout(endRestore, 200);
        }
      }
    };

    const frame = requestAnimationFrame(refresh);
    void document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(saveFrame);
      window.removeEventListener("load", refresh);
      window.removeEventListener("pagehide", savePosition);
      window.removeEventListener("scroll", scheduleSavePosition);
      window.removeEventListener("wheel", endRestore);
      window.removeEventListener("touchstart", endRestore);
      window.removeEventListener("pointerdown", endRestore);
      window.removeEventListener("keydown", endRestore);
      mm.revert();
      history.scrollRestoration = previousScrollRestoration;
    };
  }, []);
  return <div ref={root} className="memory-archive">{children}</div>;
}
