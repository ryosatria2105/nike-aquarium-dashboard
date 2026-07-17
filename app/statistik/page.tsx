"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, TrendingUp, Trophy, TrendingDown, Rocket, ChevronRight, Maximize2 } from "lucide-react";
import { ChartModal } from "@/components/ui/ChartModal";
import { MetricCard } from "@/components/ui/MetricCard";
import { DonutChart } from "@/components/ui/DonutChart";
import { MonthDropdown } from "@/components/ui/MonthDropdown";
import { ShiftBadge } from "@/components/ui/ShiftBadge";
import { formatRupiah, formatRupiahShort } from "@/lib/format";

interface TopEntry {
  id: string;
  tanggal: string;
  shift: "pagi" | "siang";
  namaPegawai: string;
  nominalMesin: string;
}

interface StatistikData {
  month: string;
  monthLabel: string;
  availableMonths: { key: string; label: string }[];
  monthTotal: number;
  avgDaily: number;
  bestDay: { date: string; total: number } | null;
  worstDay: { date: string; total: number } | null;
  growthPercent: number | null;
  shiftBreakdown: { pagi: number; siang: number };
  dailyTrend: { date: string; total: number }[];
  topHighest: TopEntry[];
  topLowest: TopEntry[];
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-surface px-3 py-2 text-xs shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
      <span className="font-tabular font-semibold text-foreground">
        {formatRupiah(payload[0].value)}
      </span>
    </div>
  );
}

export default function StatistikPage() {
  const router = useRouter();
  const [month, setMonth] = useState<string | null>(null);
  const [data, setData] = useState<StatistikData | null>(null);
  const [topMode, setTopMode] = useState<"tertinggi" | "terendah">("tertinggi");
  const [trendExpanded, setTrendExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const query = month ? `?month=${month}` : "";
    fetch(`/api/statistik${query}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setMonth(json.month);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  if (!data) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pt-8 pb-6">
        <div className="h-11 w-40 animate-pulse rounded-2xl bg-surface-secondary" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-surface-secondary" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-card bg-surface-secondary" />
        <div className="h-64 animate-pulse rounded-card bg-surface-secondary" />
      </main>
    );
  }

  const { pagi, siang } = data.shiftBreakdown;
  const total = pagi + siang;
  const pagiPercent = total > 0 ? Math.round((pagi / total) * 100) : 0;
  const siangPercent = total > 0 ? 100 - pagiPercent : 0;

  const trendData = data.dailyTrend;
  const topList = topMode === "tertinggi" ? data.topHighest : data.topLowest;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-8 pb-6 sm:pt-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            aria-label="Kembali ke Dashboard"
            className="ios-press flex h-9 w-9 shrink-0 items-center justify-center text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ios-large-title text-foreground">Statistik</h1>
        </div>
        <MonthDropdown value={data.month} options={data.availableMonths} onChange={setMonth} />
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<TrendingUp className="h-[18px] w-[18px]" />}
          iconColor="var(--primary)"
          label="Rata-rata Harian"
          value={formatRupiah(Math.round(data.avgDaily))}
        />
        <MetricCard
          icon={<Trophy className="h-[18px] w-[18px]" />}
          iconColor="var(--success)"
          label="Hari Terbaik"
          value={
            data.bestDay ? format(parseISO(data.bestDay.date), "d MMM", { locale: idLocale }) : "-"
          }
          sub={data.bestDay ? formatRupiah(data.bestDay.total) : undefined}
          subColor="var(--success)"
        />
        <MetricCard
          icon={<TrendingDown className="h-[18px] w-[18px]" />}
          iconColor="var(--warning)"
          label="Hari Terendah"
          value={
            data.worstDay ? format(parseISO(data.worstDay.date), "d MMM", { locale: idLocale }) : "-"
          }
          sub={data.worstDay ? formatRupiah(data.worstDay.total) : undefined}
          subColor="var(--warning)"
        />
        <MetricCard
          icon={<Rocket className="h-[18px] w-[18px]" />}
          iconColor="#AF52DE"
          label="Pertumbuhan Bulanan"
          value={
            data.growthPercent !== null
              ? `${data.growthPercent >= 0 ? "+" : ""}${data.growthPercent.toFixed(1)}%`
              : "-"
          }
          sub={data.growthPercent !== null ? "vs bulan lalu" : "Belum ada data bulan lalu"}
          subColor="#AF52DE"
        />
      </div>

      {/* Distribusi Penjualan — sama persis style-nya dengan Dashboard */}
      <div className="rounded-card bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
        <h2 className="text-[16px] font-semibold text-foreground">Distribusi Penjualan</h2>

        <div className="mt-4">
          <DonutChart
            data={[
              { key: "pagi", label: "Shift Pagi", value: pagi, color: "var(--success)" },
              { key: "siang", label: "Shift Siang", value: siang, color: "var(--warning)" },
            ]}
            centerLabel="Total Omzet"
            centerValue={formatRupiah(total)}
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
            <p className="text-[12px] text-muted">{formatRupiah(pagi)}</p>
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
            <p className="text-[12px] text-muted">{formatRupiah(siang)}</p>
          </div>
        </div>
      </div>

      {/* Tren Omzet */}
      <div className="rounded-card bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-foreground">Tren Omzet</h2>
          <button
            onClick={() => setTrendExpanded(true)}
            aria-label="Perbesar grafik"
            className="ios-press flex h-8 w-8 items-center justify-center rounded-lg bg-surface-secondary text-muted"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 8, bottom: 20, left: 14 }}>
              <CartesianGrid stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(parseISO(v), "d")}
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                interval={2}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Tanggal",
                  position: "insideBottom",
                  offset: -14,
                  fill: "var(--muted)",
                  fontSize: 11,
                }}
              />
              <YAxis
                tickFormatter={(v) => formatRupiahShort(v)}
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                width={46}
                tickCount={6}
                label={{
                  value: "Omzet (Rp)",
                  angle: -90,
                  position: "insideLeft",
                  dx: -14,
                  fill: "var(--muted)",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {trendExpanded && (
        <ChartModal title="Tren Omzet — Semua Hari" onClose={() => setTrendExpanded(false)}>
          <div style={{ width: `${trendData.length * 44}px`, height: "100%", minHeight: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 16, bottom: 30, left: 18 }}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => format(parseISO(v), "d MMM", { locale: idLocale })}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Tanggal",
                    position: "insideBottom",
                    offset: -20,
                    fill: "var(--muted)",
                    fontSize: 12,
                  }}
                />
                <YAxis
                  tickFormatter={(v) => formatRupiahShort(v)}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickCount={8}
                  label={{
                    value: "Omzet (Rp)",
                    angle: -90,
                    position: "insideLeft",
                    dx: -16,
                    fill: "var(--muted)",
                    fontSize: 12,
                  }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartModal>
      )}

      {/* Top 5 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-foreground">
            Top 5 {topMode === "tertinggi" ? "Tertinggi" : "Terendah"}
          </h2>
          <div className="flex rounded-full bg-surface-secondary p-1">
            {(["tertinggi", "terendah"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTopMode(m)}
                className={`ios-press rounded-full px-3 py-1 text-[12px] font-medium capitalize ${
                  topMode === m ? "bg-surface text-foreground shadow-sm" : "text-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {topList.length === 0 && (
            <div className="rounded-card bg-surface p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
              <p className="text-[13px] text-muted">Belum ada data di {data.monthLabel}.</p>
            </div>
          )}

          {topList.map((entry) => (
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