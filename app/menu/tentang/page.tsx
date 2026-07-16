"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  History,
  ShieldCheck,
  ImageIcon,
  Moon,
} from "lucide-react";

const FITUR = [
  {
    icon: ClipboardList,
    title: "Input Laporan Shift",
    desc: "Catat omzet mesin kasir & tunai per shift (Pagi/Siang) lengkap dengan bukti foto struk.",
  },
  {
    icon: History,
    title: "Riwayat Laporan",
    desc: "Lihat, filter, urutkan, edit, dan kelola seluruh laporan yang pernah diinput.",
  },
  {
    icon: ImageIcon,
    title: "Bukti Foto Struk",
    desc: "Setiap laporan didukung sampai 2 foto struk yang bisa dilihat penuh dan diunduh kapan saja.",
  },
  {
    icon: ShieldCheck,
    title: "Akses Berlapis dengan PIN",
    desc: "Dashboard & Statistik omzet toko dilindungi PIN khusus, terpisah dari akses input harian.",
  },
  {
    icon: Moon,
    title: "Mode Terang & Gelap",
    desc: "Tampilan aplikasi bisa disesuaikan sesuai kenyamanan mata, tersimpan otomatis di perangkat.",
  },
];

export default function TentangPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-10">
      <button
        onClick={() => router.back()}
        aria-label="Kembali"
        className="ios-press mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-foreground shadow-sm"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Header — rata kiri, tanpa ikon dalam kotak bundar generik */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold leading-tight text-foreground">Nike Aquarium</h1>
        <p className="mt-1 text-[13px] font-medium text-primary">
          Aplikasi Monitoring Omzet Toko · v1.0.0
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-muted">
          Aplikasi internal untuk mencatat dan memantau laporan omzet penjualan toko secara
          harian per shift. Dibangun untuk melengkapi — bukan menggantikan — mesin kasir yang
          sudah ada, sekaligus merapikan pencatatan yang sebelumnya dilakukan manual di kertas.
        </p>
      </div>

      <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-muted">
        Fitur Utama
      </p>
      <div className="mb-8 flex flex-col gap-3">
        {FITUR.map((f) => (
          <div
            key={f.title}
            className="flex gap-3 rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <f.icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-foreground">{f.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-muted">
        Informasi Aplikasi
      </p>
      <div className="mb-8 divide-y divide-border overflow-hidden rounded-card bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[14px] text-foreground">Versi Aplikasi</span>
          <span className="text-[14px] font-medium text-muted">v1.0.0</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[14px] text-foreground">Status</span>
          <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#34C759]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
            Aktif
          </span>
        </div>
      </div>

      {/* Footer credit — kartu ringkas, bukan teks polos di tengah */}
      <div className="flex items-center justify-between rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
        <div>
          <p className="text-[12px] text-muted">Designed &amp; Developed by</p>
          <p className="mt-0.5 text-[14px] font-semibold text-foreground">
            Ryo Satriagung Hidayat
          </p>
        </div>
        <span className="rounded-full bg-surface-secondary px-3 py-1.5 text-[11px] font-medium text-muted">
          v1.0.0
        </span>
      </div>
    </main>
  );
}