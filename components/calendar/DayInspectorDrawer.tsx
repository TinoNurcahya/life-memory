"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowUpRight, MapPin, Tag, User, X } from "lucide-react";
import type { TimelineItem } from "@/lib/queries/activities";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import { LightboxModal } from "@/components/shared/LightboxModal";
import styles from "./DayInspectorDrawer.module.css";

interface DayInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  items: TimelineItem[];
  demo?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  career: "Karier",
  social: "Sosial",
  health: "Kesehatan",
  learning: "Belajar",
  leisure: "Waktu luang",
  routine: "Rutinitas",
  other: "Lainnya",
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableElements(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.closest("[inert]") && element.getClientRects().length > 0,
  );
}

function DayInspectorPanel({ onClose, date, items, demo = false }: Omit<DayInspectorDrawerProps, "isOpen">) {
  const titleId = useId();
  const summaryId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const photoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [lightbox, setLightbox] = useState<{ item: TimelineItem; index: number } | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overlay = overlayRef.current;
    const shell = Array.from(document.querySelectorAll<HTMLElement>(".lm-vault-shell--dashboard"))
      .find((element) => element !== overlay && !overlay?.contains(element));
    const wasInert = shell?.inert ?? false;
    const scrollContainers = shell
      ? Array.from(shell.querySelectorAll<HTMLElement>("*"))
        .filter((element) => /auto|scroll/.test(getComputedStyle(element).overflowY))
      : [];
    const scrollLocks = [document.body, ...scrollContainers].map((element) => ({
      element,
      overflow: element.style.overflow,
      overflowX: element.style.overflowX,
      overflowY: element.style.overflowY,
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft,
    }));

    scrollLocks.forEach(({ element }) => { element.style.overflow = "hidden"; });
    if (shell) shell.inert = true;
    closeButtonRef.current?.focus({ preventScroll: true });

    const activeDialog = () => lightboxRef.current ?? panelRef.current;
    const keepFocus = (event: FocusEvent) => {
      const root = activeDialog();
      if (root && event.target instanceof Node && !root.contains(event.target)) {
        (root.querySelector<HTMLButtonElement>("button") ?? root).focus({ preventScroll: true });
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && ["k", "b"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (event.key === "Escape") {
        // The shared lightbox owns its Escape event; the enclosing day stays open.
        if (lightboxRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const root = activeDialog();
      if (!root) return;
      const controls = focusableElements(root);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        root.focus({ preventScroll: true });
      } else if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("focusin", keepFocus);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("focusin", keepFocus);
      document.removeEventListener("keydown", handleKeyDown, true);
      if (shell) shell.inert = wasInert;
      scrollLocks.forEach(({ element, overflow, overflowX, overflowY, scrollTop, scrollLeft }) => {
        element.style.overflow = overflow;
        element.style.overflowX = overflowX;
        element.style.overflowY = overflowY;
        element.scrollTop = scrollTop;
        element.scrollLeft = scrollLeft;
      });
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    if (lightbox) {
      lightboxRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    } else if (photoTriggerRef.current?.isConnected) {
      photoTriggerRef.current.focus({ preventScroll: true });
      photoTriggerRef.current = null;
    }
  }, [lightbox]);

  const parsedDate = date ? new Date(`${date}T00:00:00Z`) : null;
  const validDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const formattedDate = validDate
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(parsedDate)
    : date || "Memori harian";
  const weekday = validDate
    ? new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" }).format(parsedDate)
    : "Catatan harian";
  const totalPhotos = items.reduce((total, item) => total + (item.imageUrls?.length ?? 0), 0);
  const linkSuffix = demo ? "?demo=jimmy" : "";

  return (
    <div
      ref={overlayRef}
      className={`lm-vault-shell--dashboard ${dashboardSans.variable} ${dashboardSerif.variable} ${styles.overlay}`}
      data-calendar-day-overlay
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal={lightbox ? undefined : true}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        aria-hidden={lightbox ? true : undefined}
        inert={Boolean(lightbox)}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Memori harian <span aria-hidden="true">/</span> {weekday}</p>
            <h2 id={titleId} className={styles.title}>{formattedDate}</h2>
            <p id={summaryId} className={styles.daySummary}>
              {items.length} memori <span aria-hidden="true">·</span> {totalPhotos} foto
            </p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className={styles.close} aria-label="Tutup memori harian">
            <X size={21} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p>Belum ada memori di hari ini.</p>
              <span>Catatan yang kamu simpan untuk tanggal ini akan muncul di sini.</span>
            </div>
          ) : items.map((item, itemIndex) => {
            const images = item.imageUrls ?? [];
            return (
              <article key={item.id} className={styles.memory}>
                <div className={styles.metadata}>
                  <span className={styles.memoryNumber}>{String(itemIndex + 1).padStart(2, "0")}</span>
                  <span>{CATEGORY_LABELS[item.category ?? "other"] ?? "Lainnya"}</span>
                  {item.timeHint && <span>{item.timeHint}</span>}
                  {item.isFirstTime && <span>Pertama kali</span>}
                  {item.eventStatus === "planned" && <span>Direncanakan</span>}
                  {item.eventStatus === "cancelled" && <span>Dibatalkan</span>}
                </div>

                {images.length > 0 && (
                  <div className={styles.gallery} data-layout={Math.min(images.length, 4)}>
                    {images.slice(0, 4).map((src, imageIndex) => (
                      <button
                        key={`${item.id}-photo-${imageIndex}`}
                        type="button"
                        className={styles.photo}
                        aria-label={`Buka foto ${imageIndex + 1} dari ${images.length}: ${item.summary}`}
                        aria-haspopup="dialog"
                        onClick={(event) => {
                          photoTriggerRef.current = event.currentTarget;
                          setLightbox({ item, index: imageIndex });
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={item.summary || `Foto memori ${imageIndex + 1}`} loading="lazy" />
                        {imageIndex === 3 && images.length > 4 && <span className={styles.morePhotos}>+{images.length - 4} foto</span>}
                      </button>
                    ))}
                  </div>
                )}

                <p className={styles.summary}>{item.summary}</p>
                {item.sourceText && item.sourceText !== item.summary && <blockquote className={styles.source}>{item.sourceText}</blockquote>}

                {(item.people.length > 0 || item.places.length > 0 || item.topics.length > 0) && (
                  <div className={styles.entities}>
                    {item.people.map((person) => <Link key={person.id} href={`/people/${person.id}${linkSuffix}`} onClick={onClose}><User size={13} aria-hidden="true" /><span>{person.name}</span></Link>)}
                    {item.places.map((place) => <Link key={place.id} href={`/places/${place.id}${linkSuffix}`} onClick={onClose}><MapPin size={13} aria-hidden="true" /><span>{place.name}</span></Link>)}
                    {item.topics.map((topic) => <Link key={topic.id} href={`/topics/${topic.id}${linkSuffix}`} onClick={onClose}><Tag size={13} aria-hidden="true" /><span>{topic.name}</span></Link>)}
                  </div>
                )}

                <Link className={styles.timelineLink} href={`/timeline${linkSuffix}#${item.id}`} onClick={onClose}>
                  Lihat di timeline <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <span>Semua memori pada tanggal ini.</span>
          <button type="button" onClick={onClose}>Selesai</button>
        </footer>
      </aside>

      {lightbox && (
        <div ref={lightboxRef} className={styles.lightbox}>
          <LightboxModal
            images={lightbox.item.imageUrls ?? []}
            initialIndex={lightbox.index}
            isOpen
            onClose={closeLightbox}
            caption={lightbox.item.summary}
            date={`${weekday}, ${formattedDate}`}
            labels={{ close: "Tutup foto", previous: "Foto sebelumnya", next: "Foto selanjutnya", openImage: "Buka gambar penuh" }}
          />
        </div>
      )}
    </div>
  );
}

export function DayInspectorDrawer({ isOpen, ...props }: DayInspectorDrawerProps) {
  if (!isOpen || typeof document === "undefined") return null;
  return createPortal(<DayInspectorPanel key={props.date} {...props} />, document.body);
}
