"use client";

import { forwardRef, useEffect, useState } from "react";

interface CurrencyInputProps {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  "aria-invalid"?: boolean;
}

function formatDigits(digits: string): string {
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ id, value, onChange, placeholder, ...props }, ref) => {
    const [display, setDisplay] = useState(
      value != null ? formatDigits(String(value)) : ""
    );

    // Sync tampilan kalau value di-reset dari parent (misal setelah submit sukses)
    useEffect(() => {
      if (value == null) setDisplay("");
    }, [value]);

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-muted">
          Rp
        </span>
        <input
          ref={ref}
          id={id}
          inputMode="numeric"
          placeholder={placeholder}
          value={display}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            setDisplay(formatDigits(digits));
            onChange(digits ? Number(digits) : null);
          }}
          className="font-tabular h-[52px] w-full rounded-2xl bg-surface-secondary pl-10 pr-4 text-[17px] text-foreground outline-none ring-2 ring-transparent transition-shadow focus:ring-primary/60"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";