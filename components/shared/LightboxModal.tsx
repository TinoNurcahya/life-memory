"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface LightboxModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  caption?: string;
  date?: string;
}

export function LightboxModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  caption,
  date,
}: LightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevInitial, setPrevInitial] = useState(initialIndex);

  if (prevInitial !== initialIndex) {
    setPrevInitial(initialIndex);
    setCurrentIndex(initialIndex);
  }

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Memory Photo Lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div
        className="absolute top-4 inset-x-4 flex items-center justify-between z-10 text-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {images.length > 1 && (
            <span className="font-mono text-xs bg-black/50 border border-white/20 rounded-full px-2.5 py-1 text-white">
              {currentIndex + 1} / {images.length}
            </span>
          )}
          {date && (
            <span className="font-mono text-xs text-white/60 hidden sm:inline">
              {date}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={currentImage}
            download={`life-memory-${date || "photo"}.jpg`}
            target="_blank"
            rel="noreferrer"
            title="Buka gambar penuh"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup lightbox"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Prev / Next Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Foto sebelumnya"
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Foto selanjutnya"
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Main Image Frame */}
      <div
        className="relative max-w-5xl max-h-[82vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={caption || "Memory photo"}
          className="max-h-[76vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
        />

        {caption && (
          <p className="mt-3.5 max-w-2xl text-center font-serif text-sm text-white/80 line-clamp-2 px-4">
            &ldquo;{caption}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
