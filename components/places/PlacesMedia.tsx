"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LightboxModal } from "@/components/shared/LightboxModal";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import type { PlaceMemoryPreview } from "@/lib/places/model";
import styles from "./Places.module.css";

export function PlacesCover({ memory, unavailable = false }: { memory: PlaceMemoryPreview | null; unavailable?: boolean }) {
  const src = memory?.imageUrls?.[0];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasPhoto = Boolean(src && failedSrc !== src);
  return (
    <div className={styles.cover} data-places-cover={hasPhoto ? "photo" : "text"}>
      {hasPhoto ? (
        // These images belong to a memory, not a verified photograph of the location.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src} alt={"Photo from memory: " + memory?.summary} loading="lazy"
          ref={image => { if (image?.complete && image.naturalWidth === 0) setFailedSrc(src ?? null); }}
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <div className={styles.textCover}>
          <span className={styles.coverLabel}>{src ? "Photo unavailable" : memory ? "Latest memory" : unavailable ? "Excerpt unavailable" : "No memories yet"}</span>
          {memory ? <p>{memory.summary}</p> : <p className={styles.coverEmpty}>{unavailable ? "Open details to view available information." : "Completed memories mentioning this place will appear here."}</p>}
        </div>
      )}
    </div>
  );
}

function PhotoDialog({ images, summary, date, onClose }: { images: string[]; summary: string; date: string; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const shell = document.querySelector<HTMLElement>(".lm-vault-shell--dashboard");
    const scroll = shell?.querySelector<HTMLElement>(".overflow-y-auto.overscroll-y-contain");
    const previousInert = shell?.inert ?? false;
    const locks = [document.body, ...(scroll ? [scroll] : [])].map(element => ({
      element, overflow: element.style.overflow, scrollTop: element.scrollTop,
    }));
    if (shell) shell.inert = true;
    locks.forEach(({ element }) => { element.style.overflow = "hidden"; });
    const controls = () => Array.from(root.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]") ?? []).filter(element => element.getClientRects().length);
    const focusStart = () => root.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    focusStart();
    const keepFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) focusStart();
    };
    const trapKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && ["k", "b"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key !== "Tab") return;
      const targets = controls(), first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("focusin", keepFocus);
    document.addEventListener("keydown", trapKey, true);
    return () => {
      document.removeEventListener("focusin", keepFocus);
      document.removeEventListener("keydown", trapKey, true);
      if (shell) shell.inert = previousInert;
      locks.forEach(({ element, overflow, scrollTop }) => { element.style.overflow = overflow; element.scrollTop = scrollTop; });
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <div ref={root} className={["lm-vault-shell--dashboard", dashboardSans.variable, dashboardSerif.variable, styles.lightbox].join(" ")} data-places-lightbox>
      <LightboxModal
        images={images} isOpen onClose={onClose} caption={summary} date={date}
        labels={{ close: "Close photo", previous: "Previous photo", next: "Next photo", openImage: "Open full image" }}
      />
    </div>,
    document.body,
  );
}

export function PlacesPhoto({ images, summary, date }: { images: string[]; summary: string; date: string }) {
  const [open, setOpen] = useState(false);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const close = useCallback(() => setOpen(false), []);
  const availableImages = images.filter(src => !failedSources.includes(src));
  const src = availableImages[0];
  if (!images.length) return null;
  const failed = !src;
  return (
    <>
      <button
        type="button" className={styles.memoryPhoto} disabled={failed}
        aria-label={failed ? "Photo unavailable" : "Open " + availableImages.length + " memory " + (availableImages.length === 1 ? "photo" : "photos") + ": " + summary}
        aria-haspopup="dialog" aria-expanded={open && !failed} onClick={() => setOpen(true)}
      >
        {failed ? <span className={styles.photoUnavailable}>Photo could not be loaded.</span> : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src} alt={"Photo from memory: " + summary} loading="lazy"
              ref={image => { if (image?.complete && image.naturalWidth === 0) setFailedSources(previous => previous.includes(src) ? previous : [...previous, src]); }}
              onError={() => setFailedSources(previous => previous.includes(src) ? previous : [...previous, src])}
            />
            <span className={styles.photoHint}>{availableImages.length > 1 ? availableImages.length + " photos" : "View photo"}</span>
          </>
        )}
      </button>
      {open && availableImages.length > 0 && <PhotoDialog key={availableImages.join("\u0000")} images={availableImages} summary={summary} date={date} onClose={close} />}
    </>
  );
}
