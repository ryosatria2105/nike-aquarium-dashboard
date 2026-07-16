"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface MonthOption {
  key: string; // "2026-07"
  label: string; // "Juli 2026"
}

export function MonthDropdown({
  value,
  options,
  onChange,
  light = false,
}: {
  value: string;
  options: MonthOption[];
  onChange: (key: string) => void;
  light?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.key === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`ios-press flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium ${
          light ? "bg-white/15 text-white" : "bg-surface-secondary text-foreground"
        }`}
      >
        {current?.label ?? value}
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 max-h-64 w-40 overflow-y-auto rounded-2xl bg-surface py-1.5 shadow-[0_8px_28px_-6px_rgba(0,0,0,0.25)]">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className={`ios-press flex w-full items-center px-3.5 py-2 text-left text-[13px] ${
                opt.key === value ? "font-semibold text-primary" : "text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}