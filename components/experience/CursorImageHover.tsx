"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "motion/react";

export interface CursorHoverItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  tag?: string;
  highlightKeyword?: string;
  image: string;
  alt?: string;
  href?: string;
  badge?: string;
}

function renderHighlightedTitle(
  title: string,
  highlightKeyword?: string,
  isInk: boolean = false,
  isActive: boolean = false
) {
  const keyword = highlightKeyword?.trim();
  if (keyword && title.toLowerCase().includes(keyword.toLowerCase())) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = title.split(regex);
    return parts.map((part, i) => {
      if (part.toLowerCase() === keyword.toLowerCase()) {
        return (
          <mark
            key={i}
            className={`inline px-1.5 py-0.5 rounded-sm font-normal not-italic bg-no-repeat bg-left transition-[background-size,color] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isInk
                ? "bg-[rgba(161,190,228,0.18)] text-[#d1e4ed] group-hover:text-white"
                : "bg-[rgba(161,190,228,0.22)] text-foreground group-hover:text-foreground"
            } ${
              isActive
                ? "bg-[length:100%_100%]"
                : "bg-[length:0%_100%] group-hover:bg-[length:100%_100%]"
            }`}
            style={{
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              backgroundImage: isInk
                ? "linear-gradient(to right, rgba(161, 190, 228, 0.35), rgba(161, 190, 228, 0.35))"
                : "linear-gradient(to right, rgba(161, 190, 228, 0.42), rgba(161, 190, 228, 0.42))",
            }}
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  if (title.includes("*")) {
    const parts = title.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <mark
            key={i}
            className={`inline px-1.5 py-0.5 rounded-sm font-normal not-italic bg-no-repeat bg-left transition-[background-size,color] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isInk
                ? "bg-[rgba(161,190,228,0.18)] text-[#d1e4ed] group-hover:text-white"
                : "bg-[rgba(161,190,228,0.22)] text-foreground group-hover:text-foreground"
            } ${
              isActive
                ? "bg-[length:100%_100%]"
                : "bg-[length:0%_100%] group-hover:bg-[length:100%_100%]"
            }`}
            style={{
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              backgroundImage: isInk
                ? "linear-gradient(to right, rgba(161, 190, 228, 0.35), rgba(161, 190, 228, 0.35))"
                : "linear-gradient(to right, rgba(161, 190, 228, 0.42), rgba(161, 190, 228, 0.42))",
            }}
          >
            {part.slice(1, -1)}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  return title;
}

/* -------------------------------------------------------------------------- */
/* High-Performance Flat Cursor Follower with Preloading & GPU Acceleration    */
/* -------------------------------------------------------------------------- */

export function CursorImageHoverList({
  items,
  variant = "default",
  className = "",
  showTag = false,
  onItemClick,
}: {
  items: CursorHoverItem[];
  variant?: "default" | "ink";
  className?: string;
  showTag?: boolean;
  onItemClick?: (item: CursorHoverItem) => void;
}) {
  const isInk = variant === "ink";
  const [activeItem, setActiveItem] = useState<CursorHoverItem | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef({ x: -1000, y: -1000, hasMoved: false });

  // Free pointer position tracking initialized with null-safe coordinates
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Smooth, snappy position tracking via calibrated spring physics (no lag, no wobble)
  const springConfig = { damping: 26, stiffness: 260, mass: 0.35 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Detect touch devices and mark component as mounted
  useEffect(() => {
    setMounted(true);
    const hasTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(hasTouch);
  }, []);

  // Pre-decode all fragment images into memory so first hover is completely jank-free
  useEffect(() => {
    if (typeof window === "undefined") return;
    items.forEach((item) => {
      const img = new window.Image();
      img.src = item.image;
    });
  }, [items]);

  // Update pointer coordinates continuously
  const updatePointer = useCallback(
    (clientX: number, clientY: number) => {
      lastPointerRef.current = { x: clientX, y: clientY, hasMoved: true };
      mouseX.set(clientX);
      mouseY.set(clientY);
    },
    [mouseX, mouseY]
  );

  // Window pointermove to keep coordinates responsive
  useEffect(() => {
    if (isTouchDevice) return;

    const onPointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [isTouchDevice, updatePointer]);

  // Optimized Scroll Sync: Only hit-test when cursor is actually within container bounds
  useEffect(() => {
    if (isTouchDevice) return;

    const onScroll = () => {
      if (!lastPointerRef.current.hasMoved || !containerRef.current) return;
      const { x, y } = lastPointerRef.current;
      const rect = containerRef.current.getBoundingClientRect();

      // Skip expensive hit testing if cursor is outside container rect
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        if (activeItem) setActiveItem(null);
        return;
      }

      const el = document.elementFromPoint(x, y);
      if (el && containerRef.current.contains(el)) {
        const itemEl = el.closest<HTMLElement>("[data-cursor-item-id]");
        if (itemEl) {
          const itemId = itemEl.getAttribute("data-cursor-item-id");
          const target = items.find((i) => i.id === itemId);
          if (target) {
            if (activeItem?.id !== target.id) {
              mouseX.set(x);
              mouseY.set(y);
              smoothX.jump(x);
              smoothY.jump(y);
              setActiveItem(target);
            }
            return;
          }
        }
      }

      if (activeItem) setActiveItem(null);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isTouchDevice, items, mouseX, mouseY, smoothX, smoothY, activeItem]);

  const handleMouseEnterItem = (item: CursorHoverItem, e: ReactMouseEvent) => {
    updatePointer(e.clientX, e.clientY);
    // On first entry, snap directly to cursor without any lag
    if (!activeItem) {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      smoothX.jump(e.clientX);
      smoothY.jump(e.clientY);
    }
    setActiveItem(item);
  };

  const handleMouseLeaveList = () => {
    setActiveItem(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => updatePointer(e.clientX, e.clientY)}
      onMouseLeave={handleMouseLeaveList}
      className={`relative select-none ${className}`}
    >
      <ul
        className={`divide-y ${
          isInk
            ? "divide-white/10 border-y border-white/15"
            : "divide-border-hairline border-y border-border-hairline"
        }`}
      >
        {items.map((item, index) => {
          const isActive = activeItem?.id === item.id;

          return (
            <li
              key={item.id}
              data-cursor-item-id={item.id}
              onMouseEnter={(e) => handleMouseEnterItem(item, e)}
              onClick={() => onItemClick?.(item)}
              className={`group relative cursor-pointer py-6 sm:py-8 px-4 sm:px-6 transition-colors duration-200 ${
                isInk
                  ? "hover:bg-white/[0.04]"
                  : "hover:bg-surface-subdued/60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-[11px] uppercase tracking-wider ${
                        isInk ? "text-white/40" : "text-faint"
                      }`}
                    >
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    {item.date && (
                      <span
                        className={`font-mono text-[11px] uppercase tracking-wider ${
                          isInk ? "text-white/60" : "text-muted"
                        }`}
                      >
                        {item.date}
                      </span>
                    )}
                    {showTag && item.tag && (
                      <span
                        className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full ${
                          isInk
                            ? "bg-white/10 border border-white/15 text-amber-200/90"
                            : "bg-surface border border-hairline text-brand"
                        }`}
                      >
                        #{item.tag}
                      </span>
                    )}
                  </div>
                  <h3
                    className={`font-serif text-2xl sm:text-3xl font-light transition-colors duration-200 ${
                      isActive
                        ? isInk
                          ? "text-white"
                          : "text-foreground"
                        : isInk
                        ? "text-white/85 group-hover:text-white"
                        : "text-foreground/85 group-hover:text-foreground"
                    }`}
                  >
                    {renderHighlightedTitle(item.title, item.highlightKeyword, isInk, isActive)}
                  </h3>
                </div>

                {item.subtitle && (
                  <p
                    className={`font-sans text-xs sm:text-sm max-w-sm sm:text-right leading-relaxed ${
                      isInk ? "text-white/65" : "text-muted"
                    }`}
                  >
                    {item.subtitle}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Free-Floating Motion Follower rendered via Portal (Flat, Hardware-Accelerated) */}
      {mounted && !isTouchDevice && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeItem && (
              <motion.div
                key="free-cursor-follower"
                aria-hidden="true"
                className="pointer-events-none fixed top-0 left-0 z-[9999] origin-center will-change-transform transform-gpu"
                style={{
                  x: smoothX,
                  y: smoothY,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.18,
                    ease: "easeOut",
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.94,
                  transition: {
                    duration: 0.14,
                    ease: "easeOut",
                  },
                }}
              >
                {/* Clean, opaque dark card without expensive backdrop-blur */}
                <div className="relative w-64 sm:w-72 md:w-80 h-44 sm:h-48 md:h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-[#070b0e] transform-gpu">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={activeItem.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute inset-0 will-change-[opacity]"
                    >
                      <Image
                        src={activeItem.image}
                        alt={activeItem.alt || activeItem.title}
                        fill
                        sizes="320px"
                        priority
                        className="object-cover filter brightness-[0.94] contrast-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                      {activeItem.date && (
                        <div className="absolute bottom-3 right-3.5 flex items-center text-white text-[11px] font-mono">
                          <span className="text-white/85 drop-shadow-sm tracking-wider uppercase">
                            {activeItem.date}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
