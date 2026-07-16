"use client";

import { Delete } from "lucide-react";

interface PinPadProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function PinPad({ length = 4, value, onChange, error }: PinPadProps) {
  function handleKeyPress(key: string) {
    if (value.length >= length) return;
    onChange(value + key);
  }
  function handleBackspace() {
    onChange(value.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"];

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-4">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-full transition-colors ${
              i < value.length ? (error ? "bg-danger" : "bg-primary") : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {keys.map((k, i) => {
          if (k === "") return <div key={i} />;
          if (k === "backspace") {
            return (
              <button
                key={i}
                type="button"
                onClick={handleBackspace}
                aria-label="Hapus"
                className="ios-press flex h-16 w-16 items-center justify-center rounded-full text-foreground"
              >
                <Delete className="h-5 w-5" />
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleKeyPress(k)}
              className="ios-press flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary text-[26px] font-medium text-foreground"
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}