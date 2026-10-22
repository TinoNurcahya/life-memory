"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { LightboxModal } from "@/components/shared/LightboxModal";

interface MemoryImageGridProps {
  images?: string[];
  summary?: string;
  date?: string;
  compact?: boolean;
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
          className="memory-image-compact group relative shrink-0 overflow-hidden rounded-lg border border-hairline/80 bg-surface-subdued"
          aria-label={`Open ${count} ${count === 1 ? "memory photo" : "memory photos"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt={summary || "Memory photo"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-transparent to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-3 w-3 text-white" />
            {count > 1 && <span className="text-xs font-medium text-white">{count}</span>}
          </span>
        </button>
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
