"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, X, Copy, Check, Compass, MapPin, User, Calendar } from "lucide-react";
import { toast } from "sonner";

export interface PolaroidExportData {
  id: string;
  date: string;
  category: string;
  text: string;
  people?: string[];
  places?: string[];
  topics?: string[];
  isFirstTime?: boolean;
}

interface PolaroidExportModalProps {
  memory: PolaroidExportData | null;
  onClose: () => void;
}

export default function PolaroidExportModal({
  memory,
  onClose,
}: PolaroidExportModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  if (!memory) return null;

  const handleDownload = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading("Rendering memory snapshot...");

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
      });

      const link = document.createElement("a");
      const filename = `life-memory-${memory.category}-${Date.now()}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast.success("Polaroid saved to downloads!", { id: toastId });
    } catch (err: any) {
      toast.error("Failed to render snapshot: " + err.message, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading("Copying snapshot to clipboard...");

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
      toast.success("Polaroid copied to clipboard!", { id: toastId });
    } catch {
      toast.error("Clipboard copy not supported on this browser", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface border border-border-hairline rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">
              Memory Keepsake
            </h3>
            <p className="text-xs font-mono text-muted">
              Export archival Polaroid card
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-canvas transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Polaroid Card Container */}
        <div className="flex justify-center overflow-hidden py-2">
          <div
            ref={cardRef}
            className="w-72 bg-[#FBF9F5] text-[#2C2825] p-5 pb-7 rounded-sm shadow-xl border border-[#E6E1D8] space-y-4 font-sans select-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {/* Top Tape Accent */}
            <div className="w-20 h-3 bg-[#EAE4D7]/70 mx-auto rounded-xs -mt-6 mb-2 border-b border-[#D8D0C0]" />

            {/* Inner Frame */}
            <div className="bg-[#EFEAE1] border border-[#DDD5C7] rounded-sm p-4 min-h-[170px] flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#8C7A68]">
                  #{memory.category}
                </span>
                {memory.isFirstTime && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono bg-[#E2D5BE] text-[#5A4B36] px-1.5 py-0.5 rounded">
                    <Compass className="w-2.5 h-2.5" /> 1st Time
                  </span>
                )}
              </div>

              <p className="font-serif italic text-base leading-snug text-[#2E2822] my-auto">
                &ldquo;{memory.text}&rdquo;
              </p>

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#D8CFC0]/60 text-[10px] font-sans text-[#786958]">
                {memory.places && memory.places[0] && (
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" /> {memory.places[0]}
                  </span>
                )}
                {memory.people && memory.people[0] && (
                  <span className="inline-flex items-center gap-0.5">
                    <User className="w-2.5 h-2.5" /> {memory.people[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Polaroid Bottom Note Area */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#8C7A68] pt-1">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {memory.date}
              </span>
              <span className="text-[10px] tracking-widest uppercase">
                Life Memory
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-canvas font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-canvas border border-border-hairline text-foreground font-medium text-xs sm:text-sm hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            {hasCopied ? (
              <>
                <Check className="w-4 h-4 text-cat-health-text" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
