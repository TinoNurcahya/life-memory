"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Vector paths for "Life Memory" extracted directly from Newsreader font
const LETTER_PATHS = [
  {
    char: "L",
    d: "M100.75 95.89L97.84 112.12L97.08 112.12L92.80 110L70.91 110L70.91 106.62L97.26 106.62L92.15 107.66L99.24 95.53L100.75 95.89M80.20 63.16L74.51 65.04L74.51 110L63.06 110L63.06 108.60L68.75 106.72L68.75 65.04L63.06 63.16L63.06 61.76L80.20 61.76",
  },
  {
    char: "i",
    d: "M111.66 67.48Q109.75 67.48 108.55 66.24Q107.34 65 107.34 63.20Q107.34 61.40 108.55 60.16Q109.75 58.92 111.66 58.92Q113.57 58.92 114.77 60.16Q115.98 61.40 115.98 63.20Q115.98 65 114.77 66.24Q113.57 67.48 111.66 67.48M114.22 78.61L114.86 78.61L114.65 84.44L114.65 106.94L120.23 108.67L120.23 110L103.92 110L103.92 108.67L109.39 106.94L109.39 85.30Q109 84.87 108.15 84.35Q107.30 83.83 106.24 83.32Q105.18 82.82 104.06 82.50L104.06 81.38",
  },
  {
    char: "f",
    d: "M143.20 82.64L130.20 82.64L128.80 83.50L122.68 82.64L122.68 81.52L129.30 79.33L130.99 79.33L143.84 79.33L143.20 82.64M134.05 74.25L134.05 106.94L140.21 108.67L140.21 110L123.32 110L123.32 108.67L128.80 106.94L128.80 78Q128.80 72.85 130.42 69.21Q132.04 65.58 134.75 63.31Q137.47 61.04 140.78 59.98Q144.10 58.92 147.44 58.92Q149.24 58.92 150.50 59.20Q151.76 59.49 152.56 59.98Q153.35 60.46 153.71 61.09Q154.07 61.72 154.07 62.44Q154.07 63.88 153.08 64.80Q152.09 65.72 150.68 65.72Q149.46 65.72 148.63 65.22Q147.80 64.71 147.07 64.06Q146.33 63.42 145.39 62.91Q144.46 62.41 143.02 62.41Q140.75 62.41 138.70 63.51Q136.64 64.60 135.35 67.20Q134.05 69.79 134.05 74.25",
  },
  {
    char: "e",
    d: "M161.66 78.61Q165.16 78.61 167.71 80.16Q170.27 81.70 171.80 84.67Q173.33 87.64 173.69 91.93L151.66 91.93L151.73 89.52L170.23 88.65L167.78 90.16Q167.53 87.57 166.76 85.61Q165.98 83.65 164.62 82.55Q163.25 81.45 161.12 81.45Q158.60 81.45 156.70 82.84Q154.79 84.22 153.73 86.89Q152.66 89.55 152.66 93.40Q152.66 97.40 154.23 100.32Q155.80 103.23 158.60 104.82Q161.41 106.40 165.16 106.40Q166.52 106.40 167.84 106.04Q169.15 105.68 170.45 104.96Q171.74 104.24 172.97 103.20L173.87 104.17Q172.07 106.40 170.20 107.86Q168.32 109.32 166.24 110.02Q164.15 110.72 161.74 110.72Q157.56 110.72 154.30 108.69Q151.04 106.65 149.17 103.12Q147.30 99.60 147.30 95.10Q147.30 90.56 149.03 86.82Q150.76 83.07 153.98 80.84Q157.20 78.61 161.66 78.61",
  },
  {
    char: "M",
    d: "M259.51 65.04L262.68 106.72L268.33 108.60L268.33 110L251.30 110L251.30 108.60L256.96 106.72L254.18 66.91L254.69 67.02L235.39 110.68L233.88 110.68L214.33 67.45L214.84 67.34L212.46 106.72L218.11 108.60L218.11 110L203.32 110L203.32 108.60L209 106.72L212.10 65.22L206.23 63.16L206.23 61.76L218.18 61.76L236.40 102.62L235.54 102.62L253.82 61.76L265.20 61.76L265.20 63.16",
  },
  {
    char: "e",
    d: "M287.27 78.61Q290.76 78.61 293.32 80.16Q295.87 81.70 297.40 84.67Q298.93 87.64 299.29 91.93L277.26 91.93L277.33 89.52L295.84 88.65L293.39 90.16Q293.14 87.57 292.36 85.61Q291.59 83.65 290.22 82.55Q288.85 81.45 286.73 81.45Q284.21 81.45 282.30 82.84Q280.39 84.22 279.33 86.89Q278.27 89.55 278.27 93.40Q278.27 97.40 279.83 100.32Q281.40 103.23 284.21 104.82Q287.02 106.40 290.76 106.40Q292.13 106.40 293.44 106.04Q294.76 105.68 296.05 104.96Q297.35 104.24 298.57 103.20L299.47 104.17Q297.67 106.40 295.80 107.86Q293.93 109.32 291.84 110.02Q289.75 110.72 287.34 110.72Q283.16 110.72 279.91 108.69Q276.65 106.65 274.78 103.12Q272.90 99.60 272.90 95.10Q272.90 90.56 274.63 86.82Q276.36 83.07 279.58 80.84Q282.80 78.61 287.27 78.61",
  },
  {
    char: "m",
    d: "M313.30 78.61L314.38 85.20L314.38 106.94L319.60 108.67L319.60 110L303.65 110L303.65 108.67L309.12 106.94L309.12 85.74Q308.54 85.12 307.39 84.55Q306.24 83.97 303.79 83.18L303.79 82.28L312.54 78.61L313.30 78.61M333.67 87.18L333.67 106.94L338.86 108.67L338.86 110L323.20 110L323.20 108.67L328.42 106.94L328.42 89.41Q328.42 87.46 327.57 86.17Q326.72 84.87 325.23 84.22Q323.74 83.58 321.79 83.58Q319.34 83.58 317.06 84.51Q314.77 85.45 313.91 86.89L312.58 85.56Q314.38 83.65 315.96 82.32Q317.54 80.98 319.09 80.17Q320.64 79.36 322.24 78.99Q323.84 78.61 325.64 78.61Q328.56 78.61 330.32 79.87Q332.09 81.13 332.88 83.09Q333.67 85.05 333.67 87.18M352.97 89.30L352.97 106.94L358.51 108.67L358.51 110L342.49 110L342.49 108.67L347.71 106.94L347.71 89.41Q347.71 87.43 346.87 86.15Q346.02 84.87 344.53 84.22Q343.03 83.58 341.09 83.58Q338.64 83.58 336.35 84.51Q334.07 85.45 333.20 86.89L331.87 85.56Q333.67 83.65 335.26 82.32Q336.84 80.98 338.39 80.17Q339.94 79.36 341.54 78.99Q343.14 78.61 344.94 78.61Q349.22 78.61 351.10 81.40Q352.97 84.19 352.97 89.30",
  },
  {
    char: "o",
    d: "M377.41 107.95Q380.11 107.95 382.24 106.63Q384.36 105.32 385.58 102.57Q386.81 99.81 386.81 95.53Q386.81 90.92 385.60 87.77Q384.40 84.62 382.24 83Q380.08 81.38 377.16 81.38Q374.46 81.38 372.34 82.69Q370.21 84.01 368.99 86.76Q367.76 89.52 367.76 93.80Q367.76 98.37 368.97 101.54Q370.18 104.71 372.35 106.33Q374.53 107.95 377.41 107.95M377.20 110.72Q372.66 110.72 369.19 108.72Q365.71 106.72 363.77 103.18Q361.82 99.63 361.82 95.02Q361.82 90.27 363.86 86.56Q365.89 82.86 369.40 80.73Q372.91 78.61 377.38 78.61Q381.95 78.61 385.40 80.61Q388.86 82.60 390.80 86.13Q392.75 89.66 392.75 94.30Q392.75 99.06 390.71 102.76Q388.68 106.47 385.17 108.60Q381.66 110.72 377.20 110.72",
  },
  {
    char: "r",
    d: "M418.42 78.86Q420.25 78.86 421.08 79.72Q421.91 80.59 421.91 81.99Q421.91 83.61 420.86 84.60Q419.82 85.59 417.98 85.59Q417.19 85.59 416.40 85.29Q415.61 84.98 414.73 84.69Q413.84 84.40 412.80 84.40Q411.97 84.40 410.96 84.64Q409.96 84.87 408.98 85.30Q408.01 85.74 407.29 86.31L406.50 85.05Q408.62 83.47 410.41 82.32Q412.19 81.16 413.66 80.39Q415.14 79.62 416.33 79.24Q417.52 78.86 418.42 78.86M407.62 78.61L407.98 85.20L407.98 106.94L413.56 108.67L413.56 110L397.25 110L397.25 108.67L402.72 106.94L402.72 85.74Q402.25 85.23 401.51 84.84Q400.78 84.44 399.75 84.03Q398.72 83.61 397.39 83.18L397.39 82.28L406.86 78.61",
  },
  {
    char: "y",
    d: "M433.07 82.39L443.29 104.71L440.56 111.33L427.42 82.57L422.95 80.88L422.95 79.33L437.75 79.33L437.75 80.88L433.07 82.39M430.55 129.08Q428.71 129.08 427.49 128.05Q426.26 127.03 426.26 125.26Q426.26 124.33 426.64 123.63Q427.02 122.92 427.67 122.51Q428.32 122.10 429.04 122.10Q429.79 122.10 430.39 122.42Q430.98 122.74 431.63 123.07Q432.28 123.39 433.07 123.39Q433.82 123.39 434.47 123.07Q435.12 122.74 435.73 121.90Q436.34 121.05 436.96 119.50L441.17 108.78L442.90 104.13L450.96 82.21L446.24 80.88L446.24 79.33L457.87 79.33L457.87 80.88L454.09 82.21L440.41 117.92Q438.76 122.24 437.24 124.67Q435.73 127.10 434.11 128.09Q432.49 129.08 430.55 129.08",
  },
];

export function IntroLoader({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<"visible" | "hidden">("visible");
  const callbackRef = useRef(onComplete);
  const completedRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const penTipRef = useRef<SVGGElement>(null);
  const strokeRefs = useRef<(SVGPathElement | null)[]>([]);
  const fillRefs = useRef<(SVGPathElement | null)[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    callbackRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (completedRef.current) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = true;
    let introTriggered = false;
    let startFrame = 0;

    const finish = () => {
      if (!active || completedRef.current) return;
      completedRef.current = true;
      setPhase("hidden");
      if (!introTriggered) {
        introTriggered = true;
        callbackRef.current?.();
      }
    };

    if (motionQuery.matches) {
      finish();
      return;
    }

    const penTip = penTipRef.current;
    if (penTip) {
      gsap.set(penTip, { opacity: 0 });
    }

    // Inisialisasi garis kontur huruf (stroke) dan lapisan tinta (fill)
    strokeRefs.current.forEach((el, idx) => {
      if (!el) return;
      const len = el.getTotalLength() + 2;
      gsap.set(el, {
        strokeDasharray: len,
        strokeDashoffset: len,
        opacity: 0,
      });

      const fillEl = fillRefs.current[idx];
      if (fillEl) {
        gsap.set(fillEl, {
          opacity: 0,
          scale: 0.985,
          transformOrigin: "center center",
        });
      }
    });

    if (subtitleRef.current) {
      gsap.set(subtitleRef.current, {
        opacity: 0,
        y: 6,
        letterSpacing: "0.20em",
      });
    }

    if (containerRef.current) {
      gsap.set(containerRef.current, { opacity: 1 });
    }

    const tl = gsap.timeline({
      paused: true,
      onComplete: finish,
    });

    // Menghidupkan goresan pena kaligrafi yang menelusuri tiap huruf secara real-time
    let currentTime = 0.2; // Waktu mulai pena

    strokeRefs.current.forEach((el, idx) => {
      if (!el) return;
      const len = el.getTotalLength() + 2;
      const isCapital = idx === 0 || idx === 4; // 'L' dan 'M'
      const drawDuration = isCapital ? 0.32 : 0.2;
      const fillEl = fillRefs.current[idx];

      // Progres penelusuran pena untuk huruf ini
      const tracker = { progress: 0 };

      // 1. Munculkan kontur huruf tepat saat giliran pena
      tl.set(el, { opacity: 1 }, currentTime);

      // 2. Animasikan garis kontur huruf
      tl.to(
        el,
        {
          strokeDashoffset: 0,
          duration: drawDuration,
          ease: "power1.inOut",
        },
        currentTime
      );

      // 3. Titik pena meluncur menelusuri koordinat garis huruf secara presisi
      if (penTip) {
        // Tampilkan pena pada titik awal huruf
        tl.add(() => {
          if (!active) return;
          const startPt = el.getPointAtLength(0);
          gsap.set(penTip, {
            x: startPt.x,
            y: startPt.y,
            opacity: 1,
          });
        }, currentTime);

        tl.to(
          tracker,
          {
            progress: 1,
            duration: drawDuration,
            ease: "power1.inOut",
            onUpdate: () => {
              if (!active || !penTip) return;
              const curDist = Math.min(tracker.progress * len, len);
              const pt = el.getPointAtLength(curDist);
              gsap.set(penTip, {
                x: pt.x,
                y: pt.y,
              });
            },
          },
          currentTime
        );
      }

      // 4. Efek tinta meresap (Ink Bleed Diffusion) ke dalam badan huruf
      if (fillEl) {
        tl.to(
          fillEl,
          {
            opacity: 1,
            scale: 1.0,
            duration: 0.3,
            ease: "power2.out",
          },
          currentTime + drawDuration * 0.65
        );
      }

      // 5. Garis kontur sedikit melembut menyatu dengan tinta solid
      tl.to(
        el,
        {
          opacity: 0.35,
          duration: 0.25,
          ease: "power1.out",
        },
        currentTime + drawDuration * 0.75
      );

      // Jeda antar huruf (sedikit lebih renggang saat berpindah dari 'Life' ke 'Memory')
      const advance = idx === 3 ? 0.24 : 0.14;
      currentTime += advance;
    });

    // 6. Titik pena memudar lembut setelah seluruh huruf selesai terlukis
    if (penTip) {
      tl.to(
        penTip,
        {
          opacity: 0,
          scale: 0.5,
          duration: 0.25,
          ease: "power2.in",
        },
        currentTime + 0.05
      );
    }

    // 7. Subjudul muncul perlahan di bawah teks setelah semua huruf selesai terbentuk
    if (subtitleRef.current) {
      tl.to(
        subtitleRef.current,
        {
          opacity: 0.85,
          y: 0,
          letterSpacing: "0.22em",
          duration: 0.55,
          ease: "power2.out",
        },
        currentTime + 0.1
      );
    }

    // 8. Jeda apresiasi membaca singkat (~0.7 detik)
    tl.to({}, { duration: 0.7 });

    // 9. Pemicu buka beranda
    tl.add(() => {
      if (!introTriggered) {
        introTriggered = true;
        callbackRef.current?.();
      }
    });

    // 10. Transisi keluar murni fade out halus
    if (containerRef.current) {
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }

    startFrame = requestAnimationFrame(() => {
      if (active && !completedRef.current) tl.play();
    });

    const handleMotionChange = () => {
      if (motionQuery.matches) {
        tl.kill();
        finish();
      }
    };
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      active = false;
      cancelAnimationFrame(startFrame);
      tl.kill();
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      ref={containerRef}
      data-intro-loader
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ backgroundColor: "var(--color-canvas)", willChange: "opacity" }}
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center justify-center text-foreground px-4 w-full max-w-xl">
        {/* SVG ViewBox presisi huruf-huruf Life Memory dengan filter tinta basah & ujung pena */}
        <svg
          viewBox="50 50 420 85"
          className="w-full max-w-[480px] md:max-w-[540px] h-auto overflow-visible"
        >
          <defs>
            {/* Filter aura pendaran lembut ujung pena */}
            <filter id="pen-tip-aura" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.8" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Filter difusi tinta meresap ke serat kertas (Ink Bleed) */}
            <filter id="ink-bleed-diffusion" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.45" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -3"
                result="bleed"
              />
              <feMerge>
                <feMergeNode in="bleed" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Lapisan 1: Pengisian Tinta Meresap Organik (Ink Bleed Fill) */}
          {LETTER_PATHS.map((item, idx) => (
            <path
              key={`fill-${item.char}-${idx}`}
              ref={(el) => {
                fillRefs.current[idx] = el;
              }}
              d={item.d}
              fill="currentColor"
              stroke="none"
              filter="url(#ink-bleed-diffusion)"
            />
          ))}

          {/* Lapisan 2: Garis Kontur Gambar Huruf (Drawing Stroke) */}
          {LETTER_PATHS.map((item, idx) => (
            <path
              key={`stroke-${item.char}-${idx}`}
              ref={(el) => {
                strokeRefs.current[idx] = el;
              }}
              d={item.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Titik Ujung Pena Real-Time (Leading Pen Tip) */}
          <g
            ref={penTipRef}
            style={{ willChange: "transform, opacity", pointerEvents: "none" }}
          >
            {/* Pendaran aura luar monokrom halus */}
            <circle r="4.8" fill="currentColor" opacity="0.25" filter="url(#pen-tip-aura)" />
            {/* Inti tinta pekat ujung pena */}
            <circle r="2.2" fill="currentColor" opacity="0.9" />
            {/* Pantulan mikro kilau tinta cair */}
            <circle cx="-0.6" cy="-0.6" r="0.7" fill="var(--color-canvas)" opacity="0.85" />
          </g>
        </svg>

        {/* Subjudul muncul lembut di bawah huruf-huruf yang telah terbentuk */}
        <p
          ref={subtitleRef}
          className="mt-3 font-mono text-[10px] md:text-[11px] uppercase text-muted tracking-[0.2em]"
        >
          An archive of ordinary things
        </p>
      </div>
    </div>
  );
}
