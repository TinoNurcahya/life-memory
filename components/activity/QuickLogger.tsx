"use client";

import { useId, useLayoutEffect, useState, useRef, useTransition, type KeyboardEvent, type ChangeEvent } from "react";
import { Calendar, Camera, ChevronDown, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createPendingActivity } from "@/app/actions/activities";
import type { TimelineItem } from "@/lib/queries/activities";
import { getThematicPhotoForMemory } from "@/lib/ai/thematic-photos";
import styles from "./QuickLogger.module.css";

export type QuickLoggerSettlement = { optimisticId: string; activityId?: string; status: "resolved" | "failed"; error?: string };

const QUICK_SPARKS = [
  "Morning coffee & quiet reflection",
  "Late-night breakthrough on the project",
  "Deep conversation with an old friend",
  "Autumn walk to clear my head",
];

export function QuickLogger({
  onOptimisticItem,
  onSettled,
  demo = false,
}: {
  onOptimisticItem: (item: TimelineItem) => void;
  onSettled: (result: QuickLoggerSettlement) => void;
  demo?: boolean;
}) {
  const [rawText, setRawText] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const resize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    resize();
    let previousWidth = textarea.getBoundingClientRect().width;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width === previousWidth) return;
      previousWidth = entry.contentRect.width;
      resize();
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [rawText]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - uploadedImages.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 4 photos per memory entry.");
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);
    setIsProcessingPhotos(true);

    const readers = filesToRead.map((file) => {
      return new Promise<string>((resolve, reject) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Photo ${file.name} exceeds 5MB.`);
          reject(new Error("File too large"));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.allSettled(readers).then((results) => {
      const successful = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map((r) => r.value);
      if (successful.length > 0) {
        setUploadedImages((prev) => [...prev, ...successful].slice(0, 4));
      }
      setIsProcessingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const removePhoto = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const save = () => {
    const value = rawText.trim();
    if (!value || isPending) return;

    // In demo mode, prevent flooding with identical consecutive entries
    if (demo) {
      try {
        const stored = sessionStorage.getItem("extra_demo_memories");
        const list: TimelineItem[] = stored ? JSON.parse(stored) : [];
        if (list.length > 0 && list[0].summary.trim().toLowerCase() === value.toLowerCase()) {
          toast.info("A similar note is already saved in this demo archive.");
          setRawText("");
          setUploadedImages([]);
          return;
        }
      } catch {
        // Ignore sessionStorage errors
      }
    }

    const optimisticId = `optimistic-${Date.now()}`;
    const photosToSave = [...uploadedImages];

    onOptimisticItem({
      id: optimisticId,
      activityId: optimisticId,
      rawText: value,
      summary: value,
      sourceText: null,
      occurredAt: date,
      category: null,
      status: "PENDING",
      eventStatus: null,
      timeOfDay: null,
      timeHint: null,
      isFirstTime: false,
      needsReview: false,
      reviewReasons: [],
      people: [],
      places: [],
      topics: [],
      imageUrls: photosToSave,
    });

    setRawText("");
    setUploadedImages([]);

    if (demo) {
      const demoDetailId = `demo-entry-${Date.now()}`;
      const photos = photosToSave.length > 0 
        ? photosToSave 
        : [getThematicPhotoForMemory(value, "other")];
      const demoItem: TimelineItem = {
        id: demoDetailId,
        activityId: demoDetailId,
        rawText: value,
        summary: value,
        sourceText: value,
        occurredAt: date,
        category: "other",
        status: "RESOLVED",
        eventStatus: "completed",
        timeOfDay: "unknown",
        timeHint: null,
        isFirstTime: false,
        needsReview: false,
        reviewReasons: [],
        people: [],
        places: [],
        topics: [],
        imageUrls: photos,
      };

      try {
        const stored = sessionStorage.getItem("extra_demo_memories");
        const list = stored ? JSON.parse(stored) : [];
        sessionStorage.setItem("extra_demo_memories", JSON.stringify([demoItem, ...list]));
      } catch {
        // Ignore sessionStorage errors
      }

      setTimeout(() => {
        toast.success("Memory trace archived in demo vault!");
        onSettled({ optimisticId, activityId: demoDetailId, status: "resolved" });
      }, 1000);
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPendingActivity({ rawText: value, clientEntryDate: date });
        if (!result.success) { onSettled({ optimisticId, status: "failed", error: result.error }); toast.error(result.error); return; }
        toast.success("Memory saved. Extraction is running in the background.");
        const response = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityId: result.data.activityId,
            imageUrls: photosToSave.length > 0 ? photosToSave : undefined,
          }),
        });
        const payload = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Extraction failed.");
        onSettled({ optimisticId, activityId: result.data.activityId, status: "resolved" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Extraction failed.";
        onSettled({ optimisticId, status: "failed", error: message });
        toast.error(message);
      }
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); save(); }
  };

  return (
    <section className={styles.composer} aria-label="Capture a memory" aria-busy={isPending}>
      <div className={styles.heading}>
        <label htmlFor={inputId} className={styles.label}>Write a memory</label>
        <button
          type="button"
          className={styles.ideasToggle}
          aria-expanded={showIdeas}
          aria-controls={`${inputId}-ideas`}
          onClick={() => setShowIdeas((current) => !current)}
        >
          Writing ideas
          <ChevronDown aria-hidden="true" size={14} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        id={inputId}
        rows={2}
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="What happened today? A sentence is enough."
        aria-describedby={`${inputId}-hint`}
        className={styles.textarea}
      />
      {uploadedImages.length > 0 && (
        <div className={styles.photos}>
          {uploadedImages.map((imgUrl, idx) => (
            <div key={idx} className={styles.photo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt={`Attached photo ${idx + 1}`} />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className={styles.removePhoto}
                aria-label={`Remove photo ${idx + 1}`}
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.toolbar}>
        <label className={styles.date}>
          <Calendar aria-hidden="true" size={16} />
          <span className="sr-only">Entry date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            onClick={(event) => {
              try {
                event.currentTarget.showPicker?.();
              } catch {
                // Keep the native date field usable when showPicker is unavailable.
              }
            }}
          />
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className={styles.fileInput}
          aria-label="Attach up to four photos"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadedImages.length >= 4 || isProcessingPhotos}
          className={styles.attachButton}
          aria-label={isProcessingPhotos ? "Reading photos" : `Attach photo (${uploadedImages.length} of 4 attached)`}
          title="Attach up to 4 photos"
        >
          {isProcessingPhotos ? (
            <Loader2 aria-hidden="true" size={18} className={styles.spinner} />
          ) : (
            <Camera aria-hidden="true" size={18} />
          )}
          <span>{uploadedImages.length > 0 ? `${uploadedImages.length}/4 photos` : "Photo"}</span>
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isPending || !rawText.trim()}
          className={styles.saveButton}
        >
          {isPending && <Loader2 aria-hidden="true" size={16} className={styles.spinner} />}
          <span>{isPending ? "Saving…" : "Save memory"}</span>
        </button>
      </div>
      <p id={`${inputId}-hint`} className={styles.hint} aria-live="polite">
        {isProcessingPhotos ? "Reading photos…" : uploadedImages.length > 0
          ? `${uploadedImages.length} photo${uploadedImages.length > 1 ? "s" : ""} attached. `
          : ""}
        {!isProcessingPhotos && "Ctrl / ⌘ + Enter to save."}
      </p>
      <div id={`${inputId}-ideas`} className={styles.ideas} hidden={!showIdeas}>
        {QUICK_SPARKS.map((spark) => (
          <button
            key={spark}
            type="button"
            onClick={() => {
              setRawText(spark);
              setShowIdeas(false);
              textareaRef.current?.focus();
            }}
          >
            {spark}
          </button>
        ))}
      </div>
    </section>
  );
}
