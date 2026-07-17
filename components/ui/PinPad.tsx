"use client";

import { Delete } from "lucide-react";

interface PinPadProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  /** Kunci seluruh keypad — dipakai saat request ke server lagi berjalan. */
  disabled?: boolean;
}

export function PinPad({ length = 4, value, onChange, error, disabled }: PinPadProps) {
  function handleKeyPress(key: string) {
    if (disabled) return;
    if (value.length >= length) return;
    onChange(value + key);
  }
  function handleBackspace() {
    if (disabled) return;
    onChange(value.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"];

  return (
    <div className={`flex flex-col items-center gap-12 transition-opacity ${disabled ? "opacity-40" : "opacity-100"}`}>
      <div className="flex gap-5">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full transition-colors ${
              i < value.length ? (error ? "bg-danger" : "bg-primary") : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {keys.map((k, i) => {
          if (k === "") return <div key={i} />;
          if (k === "backspace") {
            return (
              <button
                key={i}
                type="button"
                onClick={handleBackspace}
                disabled={disabled}
                aria-label="Hapus"
                className="ios-press flex h-[76px] w-[76px] items-center justify-center rounded-full text-foreground disabled:pointer-events-none"
              >
                <Delete className="h-7 w-7" />
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleKeyPress(k)}
              disabled={disabled}
              className="ios-press flex h-[76px] w-[76px] items-center justify-center rounded-full bg-surface-secondary text-[32px] font-medium text-foreground disabled:pointer-events-none"
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}