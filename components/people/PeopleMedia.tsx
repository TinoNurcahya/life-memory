"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LightboxModal } from "@/components/shared/LightboxModal";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import type { PersonMemoryPreview } from "@/lib/people/model";
import styles from "./People.module.css";

export function PeopleCover({ memory, unavailable = false }: { memory: PersonMemoryPreview | null; unavailable?: boolean }) {
  const src = memory?.imageUrls?.[0];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasPhoto = Boolean(src && failedSrc !== src);
  return (
    <div className={styles.cover} data-people-cover={hasPhoto ? "photo" : "text"}>
      {hasPhoto ? (
        // These are memory photographs, not portraits of the named person.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src} alt={"Foto dari memori: " + memory?.summary} loading="lazy"
          ref={image => { if (image?.complete && image.naturalWidth === 0) setFailedSrc(src ?? null); }}
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <div className={styles.textCover}>
          <span className={styles.coverLabel}>{src ? "Foto tidak dapat dimuat" : memory ? "Catatan terbaru" : unavailable ? "Cuplikan belum tersedia" : "Belum ada memori"}</span>
          {memory ? <p>{memory.summary}</p> : <p className={styles.coverEmpty}>{unavailable ? "Buka detail untuk melihat informasi yang tersedia." : "Memori selesai yang menyebut orang ini akan tampil di sini."}</p>}
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
    <div ref={root} className={["lm-vault-shell--dashboard", dashboardSans.variable, dashboardSerif.variable, styles.lightbox].join(" ")} data-people-lightbox>
      <LightboxModal
        images={images} isOpen onClose={onClose} caption={summary} date={date}
        labels={{ close: "Tutup foto", previous: "Foto sebelumnya", next: "Foto selanjutnya", openImage: "Buka gambar penuh" }}
      />
    </div>,
    document.body,
  );
}

export function PeoplePhoto({ images, summary, date }: { images: string[]; summary: string; date: string }) {
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
        aria-label={failed ? "Foto tidak dapat dimuat" : "Buka " + availableImages.length + " foto memori: " + summary}
        aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}
      >
        {failed ? <span className={styles.photoUnavailable}>Foto tidak dapat dimuat.</span> : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src} alt={"Foto dari memori: " + summary} loading="lazy"
              ref={image => { if (image?.complete && image.naturalWidth === 0) setFailedSources(previous => previous.includes(src) ? previous : [...previous, src]); }}
              onError={() => setFailedSources(previous => previous.includes(src) ? previous : [...previous, src])}
            />
            <span className={styles.photoHint}>{availableImages.length > 1 ? availableImages.length + " foto" : "Lihat foto"}</span>
          </>
        )}
      </button>
      {open && <PhotoDialog images={availableImages} summary={summary} date={date} onClose={close} />}
    </>
  );
}
