"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success shrink-0" />,
  error: <XCircle className="h-5 w-5 text-danger shrink-0" />,
  info: <Info className="h-5 w-5 text-primary shrink-0" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      // Auto-dismiss — 4s cukup buat dibaca tanpa nyumbat layar kecil di HP
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
    info: (message) => push("info", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="fixed left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4"
        style={{ bottom: "calc(var(--tab-bar-height) + 0.75rem)" }}
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2.5 rounded-2xl bg-surface px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.22)] ios-navbar-blur animate-in fade-in slide-in-from-bottom-2"
          >
            {ICONS[toast.type]}
            <p className="flex-1 text-sm text-foreground">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  }
  return ctx;
}