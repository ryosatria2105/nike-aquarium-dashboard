"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

export function ChartModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="ios-press flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-2 py-4">{children}</div>
    </div>
  );
}