"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, ArrowUpDown, ChevronRight } from "lucide-react";
import { ShiftBadge } from "@/components/ui/ShiftBadge";
import { formatRupiah } from "@/lib/format";
import { getBackHref } from "@/lib/nav";
import { useAppMode } from "@/lib/useAppMode";

type Shift = "pagi" | "siang";
type ShiftFilter = "semua" | Shift;
type SortOption = "tanggal_desc" | "tanggal_asc" | "nominal_desc" | "nominal_asc";

interface OmzetEntry {
  id: string;
  tanggal: string;
  shift: Shift;
  nominalMesin: string;
  fotoStrukUrl: string;
  namaPegawai: string;
}

const FILTERS: { value: ShiftFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "pagi", label: "Pagi" },
  { value: "siang", label: "Siang" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "tanggal_desc", label: "Tanggal Terbaru" },
  { value: "tanggal_asc", label: "Tanggal Terlama" },
  { value: "nominal_desc", label: "Nominal Tertinggi" },
  { value: "nominal_asc", label: "Nominal Terendah" },
];

export default function RiwayatPage() {
  const router = useRouter();
  const mode = useAppMode();
  const [entries, setEntries] = useState<OmzetEntry[] | null>(null);
  const [filter, setFilter] = useState<ShiftFilter>("semua");
  const [sort, setSort] = useState<SortOption>("tanggal_desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    const params = new URLSearchParams();
    if (filter !== "semua") params.set("shift", filter);
    params.set("sort", sort);
    fetch(`/api/omzet?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setEntries(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, sort]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 sm:pt-12">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(getBackHref(mode, "riwayat"))}
          aria-label="Kembali"
          className="ios-press flex h-9 w-9 shrink-0 items-center justify-center text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="ios-large-title text-foreground">Riwayat Laporan</h1>
      </div>

      <div className="mb-5 flex items-center gap-2">
        <div className="flex gap-2">
          {FILTERS.map((f) => {
            const active = f.value === filter;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`ios-press flex min-w-[84px] items-center justify-center rounded-full px-4 py-2 text-[14px] font-medium ${
                  active ? "bg-primary text-primary-foreground" : "bg-surface-secondary text-muted"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setSortMenuOpen((v) => !v)}
            aria-label="Urutkan"
            className="ios-press flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-foreground"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>

          {sortMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSortMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl bg-surface shadow-[0_8px_28px_rgba(0,0,0,0.18)]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setSortMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] ${
                      sort === opt.value ? "font-semibold text-primary" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {entries === null && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-card bg-surface-secondary" />
          ))}
        </div>
      )}

      {entries?.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-[15px] font-medium text-foreground">Belum ada laporan</p>
          <p className="text-[13px] text-muted">Laporan shift yang diinput akan muncul di sini.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {entries?.map((entry) => (
          <Link
            key={entry.id}
            href={`/riwayat/${entry.id}`}
            className="ios-press flex items-center gap-3 rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.fotoStrukUrl}
              alt="Foto struk"
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-semibold text-foreground">
                  {format(parseISO(entry.tanggal), "d MMM yyyy", { locale: idLocale })}
                </span>
                <ShiftBadge shift={entry.shift} />
              </div>
              <p className="font-tabular mt-1 text-[13px] text-muted">
                {formatRupiah(Number(entry.nominalMesin))}
              </p>
              <p className="mt-0.5 text-[12px] text-muted">{entry.namaPegawai}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
          </Link>
        ))}
      </div>
    </main>
  );
}