"use client";

import Link from "next/link";
import { Fish, LineChart, FileText, Lock, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-1 flex-col justify-between px-6 pt-16 pb-10">
      <div />

      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A84FF]/12 text-[#0A84FF]">
          <Fish className="h-8 w-8" strokeWidth={2} />
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-foreground">
          Nike Aquarium
        </h1>
        <p className="mt-1 text-[15px] text-muted">Pilih mode untuk melanjutkan</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/masuk?next=/dashboard"
          onClick={() => window.localStorage.setItem("omzet:mode", "owner")}
          className="ios-press flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-start justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A84FF]/12 text-[#0A84FF]">
              <LineChart className="h-6 w-6" strokeWidth={2} />
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#0A84FF]/12 px-2.5 py-1 text-[11px] font-medium text-[#0A84FF]">
              <Lock className="h-3 w-3" strokeWidth={2.5} />
              PIN Required
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="text-left">
              <p className="text-[17px] font-semibold text-foreground">Mode Owner</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">
                Pantau omzet, statistik, grafik, dan laporan penjualan toko.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#0A84FF]" strokeWidth={2.5} />
          </div>
        </Link>

        <Link
          href="/riwayat"
          onClick={() => window.localStorage.setItem("omzet:mode", "pegawai")}
          className="ios-press flex flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#34C759]/12 text-[#34C759]">
            <FileText className="h-6 w-6" strokeWidth={2} />
          </span>
          <div className="flex items-end justify-between gap-3">
            <div className="text-left">
              <p className="text-[17px] font-semibold text-foreground">Mode Pegawai</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">
                Input laporan penjualan setiap shift dengan cepat dan lihat riwayat laporan.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#34C759]" strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      <p className="text-center text-[12px] text-muted">© Nike Aquarium</p>
    </main>
  );
}