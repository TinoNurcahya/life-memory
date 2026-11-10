"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { dashboardSans, dashboardSerif } from "./fonts";
import styles from "./DashboardEntrance.module.css";

// 4-card playing-card fan ("tumpukan remi") from left to right:
// Cards 0..2 are archive photos; Card 3 is the transparent window card.
const FAN_SLOTS = [
  { xFactor: -1.12, yOffset: 22, rotation: -18 },
  { xFactor: -0.37, yOffset: 4, rotation: -6 },
  { xFactor: 0.37, yOffset: 4, rotation: 6 },
  { xFactor: 1.12, yOffset: 22, rotation: 16 },
] as const;

const subscribe = () => () => {};

function preload(urls: string[], timeoutMs: number) {
  const loads = urls.map(src => new Promise<void>(resolve => {
    const image = new Image();
    image.onload = image.onerror = () => resolve();
    image.src = src;
    if (image.complete) resolve();
  }));
  return Promise.race([Promise.all(loads), new Promise(resolve => setTimeout(resolve, timeoutMs))]);
}

function getCardBaseSize() {
  const vw = window.innerWidth;
  const width = vw <= 767 ? vw * 0.46 : Math.min(300, Math.max(200, vw * 0.19));
  const spread = vw <= 767 ? width * 0.34 : width * 0.44;
  return { width, height: width * 1.28, spread };
}

function buildRotatedCutoutPolygon(
  holeWidth: number,
  holeHeight: number,
  offsetX: number,
  offsetY: number,
  rotationDeg: number,
) {
  if (holeWidth <= 0.5 || holeHeight <= 0.5) {
    return "polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px)";
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = vw / 2 + offsetX;
  const cy = vh / 2 + offsetY;
  const hw = holeWidth / 2;
  const hh = holeHeight / 2;
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Counter-clockwise inner loop cuts a rotated rectangular window out of the clockwise outer viewport
  const tlX = cx - hw * cos + hh * sin;
  const tlY = cy - hw * sin - hh * cos;
  const blX = cx - hw * cos - hh * sin;
  const blY = cy - hw * sin + hh * cos;
  const brX = cx + hw * cos - hh * sin;
  const brY = cy + hw * sin + hh * cos;
  const trX = cx + hw * cos + hh * sin;
  const trY = cy + hw * sin - hh * cos;

  return `polygon(0px 0px, ${vw}px 0px, ${vw}px ${vh}px, 0px ${vh}px, 0px 0px, ${tlX}px ${tlY}px, ${blX}px ${blY}px, ${brX}px ${brY}px, ${trX}px ${trY}px, ${tlX}px ${tlY}px)`;
}

/**
 * Entrance transition for /dashboard:
 * - Cards 01–03 fan out from left to right like a hand of playing cards ("tumpukan remi").
 * - Card 04 fans out into the 4th slot on the right (+16°) as a transparent window card
 *   showing the live /dashboard inside it.
 * - On expansion, Cards 01–03 fold into the back while Card 04 straightens to the center
 *   and expands to full screen.
 */
export function DashboardEntrance({
  photos,
  onDone,
}: {
  photos: string[];
  onDone: () => void;
}) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const root = useRef<HTMLDivElement>(null);
  const clippedLayer = useRef<HTMLDivElement>(null);
  const windowFrame = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const element = root.current;
    const clipped = clippedLayer.current;
    const frameEl = windowFrame.current;
    if (!isClient || !element || !clipped || !frameEl) return;

    const photoFrames = Array.from(element.querySelectorAll<HTMLElement>("[data-entrance-stack-photo]"));
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      doneRef.current();
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline({ paused: true, onComplete: finish });

    if (reduced) {
      tl.to(element, { opacity: 0, duration: 0.25, delay: 0.1, ease: "power1.out" });
    } else {
      const base = getCardBaseSize();
      const slot4 = FAN_SLOTS[3];
      const hole = {
        width: 0,
        height: 0,
        x: slot4.xFactor * base.spread * 0.4,
        y: 72,
        rotation: 4,
        borderAlpha: 0,
      };

      const applyHole = () => {
        clipped.style.clipPath = buildRotatedCutoutPolygon(
          hole.width,
          hole.height,
          hole.x,
          hole.y,
          hole.rotation,
        );
        frameEl.style.width = `${hole.width}px`;
        frameEl.style.height = `${hole.height}px`;
        frameEl.style.transform = `translate3d(calc(-50% + ${hole.x}px), calc(-50% + ${hole.y}px), 0) rotate(${hole.rotation}deg)`;
        frameEl.style.opacity = String(hole.borderAlpha);
      };

      applyHole();

      // Deal all photo cards from the bottom-center deck position into a fanned hand
      gsap.set(photoFrames, {
        width: base.width,
        height: base.height,
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 72,
        scale: 0.88,
        opacity: 0,
        rotation: 0,
      });

      photoFrames.forEach((frame, index) => {
        const slot = FAN_SLOTS[index] ?? FAN_SLOTS[0];
        const at = index * 0.17;
        tl.to(frame, {
          x: slot.xFactor * base.spread,
          y: slot.yOffset,
          rotation: slot.rotation,
          scale: 1,
          opacity: 1,
          duration: 0.46,
          ease: "expo.out",
        }, at);
        tl.add(() => {
          if (counter.current) counter.current.textContent = String(index + 1).padStart(2, "0");
        }, at);
      });

      // Step 04: Deal Card 04 into the rightmost slot of the fan as a transparent window card
      const card4At = photoFrames.length * 0.17;
      tl.add(() => {
        if (counter.current) counter.current.textContent = "04";
      }, card4At);

      tl.to(hole, {
        width: base.width,
        height: base.height,
        x: slot4.xFactor * base.spread,
        y: slot4.yOffset,
        rotation: slot4.rotation,
        borderAlpha: 1,
        duration: 0.46,
        ease: "expo.out",
        onUpdate: applyHole,
      }, card4At);

      // Hold the 4-card remi fan so the user sees all 3 photos + the 4th transparent card
      const expandAt = card4At + 0.62;

      // Tuck Cards 01–03 toward the center behind Card 04 as Card 04 straightens and expands
      tl.to(photoFrames, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 0.88,
        opacity: 0,
        duration: 0.36,
        stagger: 0.03,
        ease: "power3.inOut",
      }, expandAt);

      tl.to(element.querySelectorAll("[data-entrance-meta]"), {
        opacity: 0,
        duration: 0.25,
        ease: "power1.out",
      }, expandAt);

      // Straighten Card 04 to center (x:0, y:0, rotation:0) and expand to full screen
      tl.to(hole, {
        width: () => window.innerWidth,
        height: () => window.innerHeight,
        x: 0,
        y: 0,
        rotation: 0,
        borderAlpha: 0,
        duration: 0.68,
        ease: "expo.inOut",
        onUpdate: applyHole,
      }, expandAt);
    }

    let cancelled = false;
    preload(photos.slice(0, 3), 600).then(() => {
      if (!cancelled) tl.play();
    });

    const skip = () => tl.progress(1);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };
    element.addEventListener("click", skip);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      element.removeEventListener("click", skip);
      window.removeEventListener("keydown", onKey);
      tl.kill();
    };
  }, [isClient, photos]);

  if (!isClient) return null;

  const stackPhotos = photos.slice(0, 3);

  return createPortal(
    <div
      ref={root}
      className={[styles.overlay, dashboardSans.variable, dashboardSerif.variable].join(" ")}
      aria-hidden="true"
      data-dashboard-entrance
    >
      <div ref={clippedLayer} className={styles.clippedLayer}>
        <div className={styles.backdrop} />
        <div className={styles.stage}>
          {stackPhotos.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src + index}
              src={src}
              alt=""
              className={styles.photo}
              data-entrance-stack-photo
              decoding="async"
              style={{ zIndex: index + 1 }}
            />
          ))}
        </div>
      </div>

      <div ref={windowFrame} className={styles.windowFrame} />

      <span className={styles.wordmark} data-entrance-meta>
        life memory<span>✳</span>
      </span>
      <span className={styles.counter} data-entrance-meta>
        <span ref={counter}>01</span>
        <span className={styles.counterTotal}> / 04</span>
      </span>
      <span className={styles.hint} data-entrance-meta>
        Opening your archive
      </span>
    </div>,
    document.body,
  );
}
