"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { LightboxModal } from "@/components/shared/LightboxModal";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import styles from "./Topics.module.css";

function PhotoDialog({ images, summary, date, onClose, onImageError, trigger }: { images: string[]; summary: string; date: string; onClose: () => void; onImageError: (src: string) => void; trigger: RefObject<HTMLButtonElement | null> }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const previousFocus = trigger.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
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
      // Wait until the DOM has applied the disabled state after an image failure.
      // A replacement dialog owns focus when the remaining gallery is remounted.
      queueMicrotask(() => {
        if (previousFocus?.isConnected && !document.querySelector("[data-topics-lightbox]")) {
          const target = previousFocus.matches(":disabled") ? previousFocus.closest<HTMLElement>("article") : previousFocus;
          if (target && target !== previousFocus && !target.hasAttribute("tabindex")) {
            target.tabIndex = -1;
            target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
          }
          target?.focus({ preventScroll: true });
        }
      });
    };
  }, [trigger]);
  return createPortal(
    <div ref={root} className={["lm-vault-shell--dashboard", dashboardSans.variable, dashboardSerif.variable, styles.lightbox].join(" ")} data-topics-lightbox
      onErrorCapture={event => {
        if (event.target instanceof HTMLImageElement) {
          const src = event.target.getAttribute("src");
          if (src) onImageError(src);
        }
      }}>
      <LightboxModal
        images={images} isOpen onClose={onClose} caption={summary} date={date}
        labels={{ close: "Tutup foto", previous: "Foto sebelumnya", next: "Foto selanjutnya", openImage: "Buka gambar penuh" }}
      />
    </div>,
    document.body,
  );
}

export function TopicsPhoto({ images, summary, date }: { images: string[]; summary: string; date: string }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const close = useCallback(() => setOpen(false), []);
  const markFailed = useCallback((src: string) => {
    setFailedSources(previous => previous.includes(src) ? previous : [...previous, src]);
  }, []);
  const availableImages = images.filter(src => !failedSources.includes(src));
  const src = availableImages[0];
  if (!images.length) return null;
  const failed = !src;
  return (
    <>
      <button
        ref={trigger} type="button" className={styles.memoryPhoto} disabled={failed}
        aria-label={failed ? "Foto tidak dapat dimuat" : "Buka " + availableImages.length + " foto memori: " + summary}
        aria-haspopup="dialog" aria-expanded={open && !failed} onClick={() => setOpen(true)}
      >
        {failed ? <span className={styles.photoUnavailable}>Foto tidak dapat dimuat.</span> : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src} alt={"Foto dari memori: " + summary} loading="lazy"
              ref={image => { if (image?.complete && image.naturalWidth === 0) markFailed(src); }}
              onError={() => markFailed(src)}
            />
            <span className={styles.photoHint}>{availableImages.length > 1 ? availableImages.length + " foto" : "Lihat foto"}</span>
          </>
        )}
      </button>
      {open && availableImages.length > 0 && <PhotoDialog key={availableImages.join("\u0000")} images={availableImages} summary={summary} date={date} onClose={close} onImageError={markFailed} trigger={trigger} />}
    </>
  );
}
