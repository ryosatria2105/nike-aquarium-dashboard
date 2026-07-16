"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarDays,
  TrendingUp,
  Wallet,
  CircleCheck,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  ChevronRight,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ShiftBadge } from "@/components/ui/ShiftBadge";
import { DonutChart } from "@/components/ui/DonutChart";
import { MonthDropdown } from "@/components/ui/MonthDropdown";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { formatRupiah } from "@/lib/format";

interface DashboardData {
  month: string;
  monthLabel: string;
  isCurrentMonth: boolean;
  monthTotal: number;
  prevMonthTotal: number;
  monthChangePercent: number | null;
  todayTotal: number;
  weekTotal: number;
  allTimeTotal: number;
  totalDaysRecorded: number;
  dailyChart: { date: string; total: number }[];
  shiftBreakdown: { pagi: number; siang: number };
  todayShiftStatus: { pagi: boolean; siang: boolean };
  recentEntries: {
    id: string;
    tanggal: string;
    shift: "pagi" | "siang";
    nominalMesin: string;
    namaPegawai: string;
  }[];
  availableMonths: { key: string; label: string }[];
}

export default function DashboardPage() {
  const [month, setMonth] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const query = month ? `?month=${month}` : "";

    fetch(`/api/dashboard${query}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) throw new Error(json.error);
        setData(json);
        setMonth(json.month);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-10">
        <p className="text-danger">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pt-8 pb-6 sm:pt-12">
        <div className="h-11 w-40 animate-pulse rounded-2xl bg-surface-secondary" />
        <div className="h-48 animate-pulse rounded-card bg-surface-secondary" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 animate-pulse rounded-card bg-surface-secondary" />
          <div className="h-24 animate-pulse rounded-card bg-surface-secondary" />
          <div className="h-24 animate-pulse rounded-card bg-surface-secondary" />
          <div className="h-24 animate-pulse rounded-card bg-surface-secondary" />
        </div>
        <div className="h-80 animate-pulse rounded-card bg-surface-secondary" />
      </main>
    );
  }

  const progressCount = Number(data.todayShiftStatus.pagi) + Number(data.todayShiftStatus.siang);
  const progressLabel =
    progressCount === 2
      ? "Semua shift sudah input"
      : progressCount === 1
      ? data.todayShiftStatus.pagi
        ? "Menunggu Shift Siang"
        : "Menunggu Shift Pagi"
      : "Belum ada input hari ini";

  const pagiPercent = data.monthTotal > 0 ? Math.round((data.shiftBreakdown.pagi / data.monthTotal) * 100) : 0;
  const siangPercent = data.monthTotal > 0 ? 100 - pagiPercent : 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-8 pb-6 sm:pt-12">
      {/* App bar */}
      <div className="flex items-center justify-between">
        <h1 className="ios-large-title text-foreground">Dashboard</h1>
        <NotificationBell />
      </div>

      {/* Hero card — Omzet Bulan Ini */}
      <div
        className="rounded-card p-5 text-primary-foreground shadow-[0_12px_28px_-10px_rgba(10,31,66,0.55)]"
        style={{ background: "var(--primary-gradient)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] text-primary-foreground/75">
            Omzet Bulan Ini • {data.monthLabel}
          </p>
          <MonthDropdown
            value={data.month}
            options={data.availableMonths}
            onChange={(key) => setMonth(key)}
            light
          />
        </div>

        <p className="font-tabular mt-1 text-[30px] font-bold tracking-tight">
          {formatRupiah(data.monthTotal)}
        </p>

        {data.monthChangePercent !== null ? (
          <p
            className={`mt-1 flex items-center gap-1 text-[13px] font-medium ${
              data.monthChangePercent >= 0 ? "text-white" : "text-white/80"
            }`}
          >
            {data.monthChangePercent >= 0 ? (
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <ChevronDownIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            )}
            {Math.abs(data.monthChangePercent).toFixed(1)}% dibanding bulan lalu
          </p>
        ) : (
          <p className="mt-1 text-[13px] text-primary-foreground/75">Belum ada data bulan lalu</p>
        )}

        <div className="mt-3 h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyChart}>
              <Line type="monotone" dataKey="total" stroke="white" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI cards */}
<div className="grid grid-cols-2 auto-rows-fr gap-3">


<StatCard
  label="Omzet Hari Ini"
  value={formatRupiah(data.todayTotal)}
  icon={<CalendarDays className="h-4 w-4" />}
  accent
/>
<StatCard
  label="Omzet Minggu Ini"
  value={formatRupiah(data.weekTotal)}
  icon={<TrendingUp className="h-4 w-4" />}
/>
<StatCard
  label="Progress Hari Ini"
  value={`${progressCount} / 2 Shift`}
  icon={<CircleCheck className="h-4 w-4" />}
  tone="success"
  sub={progressLabel}
  subColor={progressCount === 2 ? "foreground" : "muted"}
/>
<StatCard
  label="Total Omzet"
  value={formatRupiah(data.allTimeTotal)}
  icon={<Wallet className="h-4 w-4" />}
  sub="Total sepanjang waktu"
/>
      </div>

      {/* Distribusi Penjualan */}
      <div className="rounded-card bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-foreground">Distribusi Penjualan</h2>
        </div>

        <div className="mt-4">
          <DonutChart
            data={[
              { key: "pagi", label: "Shift Pagi", value: data.shiftBreakdown.pagi, color: "var(--success)" },
              { key: "siang", label: "Shift Siang", value: data.shiftBreakdown.siang, color: "var(--warning)" },
            ]}
            centerLabel="Total Omzet"
            centerValue={formatRupiah(data.monthTotal)}
            centerSubLabel={data.monthLabel}
          />
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] gap-4">
          <div className="text-left">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--success)" }} />
              Shift Pagi
            </span>
            <p className="font-tabular mt-1 text-[18px] font-bold text-success">{pagiPercent}%</p>
            <p className="text-[12px] text-muted">{formatRupiah(data.shiftBreakdown.pagi)}</p>
          </div>

          <div className="w-px self-stretch bg-border" />

          <div className="text-right">
            <span className="inline-flex items-center justify-end gap-1.5 text-[13px] font-medium text-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--warning)" }} />
              Shift Siang
            </span>
            <p className="font-tabular mt-1 text-[18px] font-bold" style={{ color: "var(--warning)" }}>
              {siangPercent}%
            </p>
            <p className="text-[12px] text-muted">{formatRupiah(data.shiftBreakdown.siang)}</p>
          </div>
        </div>
      </div>

      {/* Input Terbaru */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-foreground">Input Terbaru</h2>
          <Link
            href="/riwayat"
            className="ios-press flex items-center gap-0.5 text-[13px] font-medium text-primary"
          >
            Lihat Semua
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {data.recentEntries.length === 0 && (
            <div className="rounded-card bg-surface p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
              <p className="text-[13px] text-muted">Belum ada laporan di {data.monthLabel}.</p>
            </div>
          )}

          {data.recentEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-card bg-surface p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  entry.shift === "pagi" ? "bg-success/10" : "bg-warning/10"
                }`}
              >
                <ShiftBadge shift={entry.shift} iconOnly />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-foreground">
                  {entry.namaPegawai}
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-foreground/80">
                  {entry.shift === "pagi" ? "Shift Pagi" : "Shift Siang"}
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {format(parseISO(entry.tanggal), "d MMMM yyyy", { locale: idLocale })}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="font-tabular text-[14px] font-semibold text-foreground">
                  {formatRupiah(Number(entry.nominalMesin))}
                </span>
                <Link
                  href={`/riwayat/${entry.id}`}
                  className="ios-press flex items-center gap-0.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                >
                  Lihat Detail
                  <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}