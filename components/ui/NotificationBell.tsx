"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, FilePlus2, FilePenLine, FileX2, X, CheckCheck, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type AuditAction = "created" | "updated" | "deleted";

interface AuditLogItem {
  id: string;
  action: AuditAction;
  changedBy: string;
  changedAt: string;
  entryId: string;
  tanggal: string | null;
  shift: "pagi" | "siang" | null;
}

const LAST_SEEN_KEY = "omzet:notif:lastSeen";
const DISMISSED_KEY = "omzet:notif:dismissed";

const ACTION_LABEL: Record<AuditAction, string> = {
  created: "mengirim laporan baru",
  updated: "mengedit laporan",
  deleted: "menghapus laporan",
};

const ACTION_ICON: Record<AuditAction, typeof FilePlus2> = {
  created: FilePlus2,
  updated: FilePenLine,
  deleted: FileX2,
};

const ACTION_COLOR: Record<AuditAction, string> = {
  created: "#34C759",
  updated: "#FF9500",
  deleted: "#FF3B30",
};

function readDismissed(): Set<string> {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>) {
  window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(ids)));
}

export function NotificationBell() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLogItem[] | null>(null);
  const [unread, setUnread] = useState(0);

  function loadLogs() {
    fetch("/api/audit-log?take=30")
      .then((res) => res.json())
      .then((json) => {
        const all: AuditLogItem[] = json.data ?? [];
        const dismissed = readDismissed();
        const visible = all.filter((l) => !dismissed.has(l.id));
        setLogs(visible);

        const lastSeen = window.localStorage.getItem(LAST_SEEN_KEY);
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
        setUnread(visible.filter((l) => new Date(l.changedAt).getTime() > lastSeenTime).length);
      })
      .catch(() => setLogs([]));
  }

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  }

  function markAllRead() {
    window.localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setUnread(0);
  }

  function dismissOne(id: string) {
    const dismissed = readDismissed();
    dismissed.add(id);
    writeDismissed(dismissed);
    setLogs((prev) => (prev ? prev.filter((l) => l.id !== id) : prev));
  }

  function dismissAll() {
    if (!logs || logs.length === 0) return;
    const dismissed = readDismissed();
    logs.forEach((l) => dismissed.add(l.id));
    writeDismissed(dismissed);
    setLogs([]);
    setUnread(0);
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifikasi"
        className="ios-press relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-card bg-surface shadow-[0_8px_28px_-6px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-[14px] font-semibold text-foreground">Aktivitas Terbaru</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={markAllRead}
                aria-label="Tandai semua dibaca"
                title="Tandai semua dibaca"
                className="ios-press flex items-center gap-1 text-[12px] font-medium text-primary"
              >
                <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
                Baca semua
              </button>
              {logs && logs.length > 0 && (
                <button
                  type="button"
                  onClick={dismissAll}
                  aria-label="Hapus semua notifikasi"
                  title="Hapus semua"
                  className="ios-press flex items-center gap-1 text-[12px] font-medium text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Hapus
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {logs === null && (
              <div className="px-4 py-6 text-center text-[13px] text-muted">Memuat…</div>
            )}
            {logs && logs.length === 0 && (
              <div className="px-4 py-6 text-center text-[13px] text-muted">
                Belum ada aktivitas.
              </div>
            )}
            {logs?.map((log) => {
              const Icon = ACTION_ICON[log.action];
              return (
                <div
                  key={log.id}
                  className="group flex w-full items-start gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      if (log.action !== "deleted") router.push(`/riwayat/${log.entryId}`);
                    }}
                    className="ios-press flex flex-1 items-start gap-3 text-left"
                  >
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: ACTION_COLOR[log.action] }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] leading-snug text-foreground">
                        <span className="font-semibold">{log.changedBy}</span>{" "}
                        {ACTION_LABEL[log.action]}
                        {log.shift && (
                          <span className="text-muted">
                            {" "}
                            ({log.shift === "pagi" ? "Pagi" : "Siang"}
                            {log.tanggal
                              ? `, ${format(parseISO(log.tanggal), "d MMM", { locale: idLocale })}`
                              : ""}
                            )
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {format(parseISO(log.changedAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => dismissOne(log.id)}
                    aria-label="Hapus notifikasi ini"
                    className="ios-press mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted hover:text-danger"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}