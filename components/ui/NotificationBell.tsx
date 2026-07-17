"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  FilePlus2,
  FilePenLine,
  FileX2,
  X,
  CheckCheck,
  Trash2,
  ChevronRight,
} from "lucide-react";
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

function readLastSeenTime(): number {
  const raw = window.localStorage.getItem(LAST_SEEN_KEY);
  return raw ? new Date(raw).getTime() : 0;
}

export function NotificationBell() {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLogItem[] | null>(null);
  // lastSeenTime disimpan sebagai state (bukan dibaca ulang dari
  // localStorage tiap render) supaya status "belum dibaca" tetap stabil
  // selama panel terbuka — baru diperbarui saat panel ditutup, jadi user
  // sempat lihat mana yang baru sebelum semuanya dianggap terbaca.
  const [lastSeenTime, setLastSeenTime] = useState(0);

  function loadLogs() {
    fetch("/api/audit-log?take=30")
      .then((res) => res.json())
      .then((json) => {
        const all: AuditLogItem[] = json.data ?? [];
        const dismissed = readDismissed();
        const visible = all.filter((l) => !dismissed.has(l.id));
        setLogs(visible);
      })
      .catch(() => setLogs([]));
  }

  useEffect(() => {
    setLastSeenTime(readLastSeenTime());
    loadLogs();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const unreadCount = logs
    ? logs.filter((l) => new Date(l.changedAt).getTime() > lastSeenTime).length
    : 0;

  function handleToggle() {
    if (open) {
      closePanel();
    } else {
      setOpen(true);
      loadLogs();
    }
  }

  // Status "dibaca" baru diperbarui saat panel ditutup — supaya selama
  // panel terbuka, latar abu-abu (belum dibaca) masih kelihatan dulu,
  // baru berubah putih polos (terbaca) setelah panel ditutup.
  function closePanel() {
    setOpen(false);
    const now = new Date().toISOString();
    window.localStorage.setItem(LAST_SEEN_KEY, now);
    setLastSeenTime(new Date(now).getTime());
  }

  function markAllRead() {
    const now = new Date().toISOString();
    window.localStorage.setItem(LAST_SEEN_KEY, now);
    setLastSeenTime(new Date(now).getTime());
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
  }

  function handleViewEntry(log: AuditLogItem) {
    if (log.action === "deleted") return;
    setOpen(false);
    router.push(`/riwayat/${log.entryId}`);
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
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-card bg-surface shadow-[0_8px_28px_-6px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-[14px] font-semibold text-foreground">Aktivitas Terbaru</p>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
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
              )}
              {logs && logs.length > 0 && (
                <button
                  type="button"
                  onClick={dismissAll}
                  aria-label="Hapus semua notifikasi"
                  title="Hapus semua"
                  className="ios-press flex items-center gap-1 text-[12px] font-medium text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Hapus semua
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
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
              const isDeleted = log.action === "deleted";
              const isUnread = new Date(log.changedAt).getTime() > lastSeenTime;

              const rowContent = (
                <>
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: ACTION_COLOR[log.action] }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
                      {isUnread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      )}
                      {log.changedBy}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-foreground/80">
                      {ACTION_LABEL[log.action]}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p className="text-[11.5px] text-muted">
                        {log.shift && (log.shift === "pagi" ? "Shift Pagi" : "Shift Siang")}
                        {log.shift && " • "}
                        {format(parseISO(log.changedAt), "d MMM yyyy, HH:mm", { locale: idLocale })}
                      </p>
                      {!isDeleted && (
                        <span className="ios-press flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-primary">
                          Lihat detail
                          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                  </div>
                </>
              );

              return (
                <div
                  key={log.id}
                  className={`group flex w-full items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0 ${
                    isUnread ? "bg-surface-secondary" : "bg-surface"
                  }`}
                >
                  {isDeleted ? (
                    <div className="flex flex-1 items-start gap-3 text-left">{rowContent}</div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleViewEntry(log)}
                      className="ios-press flex flex-1 items-start gap-3 text-left"
                    >
                      {rowContent}
                    </button>
                  )}

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