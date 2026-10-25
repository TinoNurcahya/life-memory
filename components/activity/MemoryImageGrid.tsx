"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { Maximize2 } from "lucide-react";
import { LightboxModal } from "@/components/shared/LightboxModal";
import styles from "./MemoryImageGrid.module.css";

interface MemoryImageGridProps {
  images?: string[];
  summary?: string;
  date?: string;
  compact?: boolean;
}

// The shell's scrolling viewport is transformed. A portal keeps compact photos
// anchored to the browser viewport, even when opened far down the timeline.
function CompactLightbox(props: ComponentProps<typeof LightboxModal>) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = container.current;
    const controls = () => Array.from(root?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)") ?? []);
    const focusStart = () => (root?.querySelector<HTMLButtonElement>("button") ?? controls()[0])?.focus();
    focusStart();

    const keepFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !root?.contains(event.target)) focusStart();
    };
    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const targets = controls();
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("focusin", keepFocus);
    root?.addEventListener("keydown", trapTab);
    return () => {
      document.removeEventListener("focusin", keepFocus);
      root?.removeEventListener("keydown", trapTab);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(<div ref={container} className={styles.lightbox}><LightboxModal {...props} /></div>, document.body);
}

export function MemoryImageGrid({ images, summary, date, compact = false }: MemoryImageGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setLightboxOpen(true);
  };

  const count = images.length;

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className={`memory-image-compact ${styles.compact}`}
          aria-label={`Open ${count} ${count === 1 ? "memory photo" : "memory photos"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt={summary || "Memory photo"}
            loading="lazy"
            className={styles.image}
          />
          {count > 1 && <span className={styles.count}>{count} photos</span>}
        </button>
        {lightboxOpen && <CompactLightbox
          labels={{ close: "Close photo", previous: "Previous photo", next: "Next photo", openImage: "Open full image" }}
          images={images}
          initialIndex={activePhotoIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          caption={summary}
          date={date}
        />}
      </>
    );
  }

  return (
    <>
      <div className="mt-3.5 overflow-hidden rounded-2xl border border-hairline/70 bg-surface-subdued/40">
        {/* Case 1: Single Hero Photo */}
        {count === 1 && (
          <div
            onClick={() => openLightbox(0)}
            className="group relative aspect-[16/9] sm:aspect-[21/9] max-h-60 sm:max-h-72 w-full cursor-zoom-in overflow-hidden bg-black/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt={summary || "Memory photo"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-end p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* Case 2: Dual Split Photos (50/50) */}
        {count === 2 && (
          <div className="grid grid-cols-2 gap-1.5 p-1.5">
            {images.slice(0, 2).map((url, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl bg-black/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={summary || `Memory photo ${idx + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
                  <Maximize2 className="h-4 w-4 text-white drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Case 3: 3 Photos Collage Grid (1 dominant + 2 stacked) */}
        {count === 3 && (
          <div className="grid grid-cols-3 gap-1.5 p-1.5">
            <div
              onClick={() => openLightbox(0)}
              className="group relative col-span-2 aspect-[4/3] sm:aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-xl bg-black/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0]}
                alt={summary || "Memory primary photo"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
                <Maximize2 className="h-4 w-4 text-white drop-shadow-md" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-1">
              {images.slice(1, 3).map((url, idx) => (
                <div
                  key={idx + 1}
                  onClick={() => openLightbox(idx + 1)}
                  className="group relative flex-1 min-h-0 cursor-zoom-in overflow-hidden rounded-xl bg-black/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={summary || `Memory photo ${idx + 2}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
                    <Maximize2 className="h-3.5 w-3.5 text-white drop-shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case 4: 4 Photos 2x2 Grid */}
        {count >= 4 && (
          <div className="grid grid-cols-2 gap-1.5 p-1.5">
            {images.slice(0, 4).map((url, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl bg-black/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={summary || `Memory photo ${idx + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
                  <Maximize2 className="h-4 w-4 text-white drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        images={images}
        initialIndex={activePhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        caption={summary}
        date={date}
      />
    </>
  );
}
