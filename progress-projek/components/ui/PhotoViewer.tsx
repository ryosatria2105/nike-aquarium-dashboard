"use client";

import { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";

export function PhotoViewer({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = alt.replace(/\s+/g, "-").toLowerCase() + ".jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(src, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="ios-press flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Unduh foto"
          className="ios-press flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-50"
        >
          {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-h-full max-w-full rounded-2xl object-contain" />
      </div>
    </div>
  );
}