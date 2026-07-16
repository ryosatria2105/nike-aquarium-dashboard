"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  History,
  Lightbulb,
  PenLine,
  Save,
  Sunrise,
  CloudSun,
} from "lucide-react";

const LANGKAH_INPUT = [
  {
    icon: Calendar,
    label: "Langkah 1",
    title: "Pilih Tanggal & Shift",
    desc:
      "Buka menu Input Laporan. Tanggal otomatis terisi hari ini, tapi bisa diganti kalau kamu menginput laporan untuk hari sebelumnya. Pilih Shift Pagi atau Siang sesuai jam kerjamu.",
  },
  {
    icon: PenLine,
    label: "Langkah 2",
    title: "Isi Total Uang Mesin & Tunai",
    desc:
      "Total Uang Mesin diisi sesuai angka omzet di layar/struk mesin kasir, karena nominal inilah yang jadi acuan omzet resmi. Total Tunai diisi sesuai hasil hitung fisik uang di laci. Kedua angka boleh berbeda, itu wajar, tapi tetap harus diisi apa adanya.",
  },
  {
    icon: Camera,
    label: "Langkah 3",
    title: "Upload Foto Struk",
    desc:
      "Foto pertama wajib. Ambil langsung dari kamera atau pilih dari galeri, dan pastikan angka di struk terbaca jelas. Foto kedua opsional, biasanya dipakai untuk bukti tambahan seperti struk tunai terpisah. Format yang didukung JPG, PNG, WEBP, maksimal 5MB per foto.",
  },
  {
    icon: Save,
    label: "Langkah 4",
    title: "Isi Nama & Catatan, lalu Simpan",
    desc:
      "Nama pegawai akan diingat otomatis untuk input berikutnya. Catatan bersifat opsional, isi kalau ada kejadian khusus (barang retur, gangguan listrik, selisih kas, dll). Tap Simpan Laporan untuk menyelesaikan.",
  },
];

const TIPS = [
  "Isi laporan sesegera mungkin setelah shift selesai, selagi struk masih ada di tangan.",
  "1 kombinasi tanggal + shift hanya boleh punya 1 laporan aktif. Kalau ternyata sudah pernah input, cari laporannya di Riwayat lalu edit, jangan input ulang dari awal.",
  "Pastikan foto struk tidak buram dan angkanya terbaca. Foto ini jadi bukti utama kalau ada pengecekan ulang.",
  "Kalau salah input, tenang saja, laporan tetap bisa diedit kapan saja lewat halaman Riwayat.",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-muted">
      {children}
    </p>
  );
}

export default function PanduanPage() {
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

      <h1 className="ios-large-title mb-1 text-foreground">Panduan Penggunaan</h1>
      <p className="mb-8 text-[15px] leading-relaxed text-muted">
        Panduan lengkap mengisi laporan omzet shift harian, dari awal sampai tersimpan.
      </p>

      {/* Ringkasan shift */}
      <section className="mb-8">
        <SectionLabel>Mengenal Shift</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB74D] to-[#FF9500] text-white shadow-sm">
              <Sunrise className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </span>
            <p className="text-[14px] font-semibold text-foreground">Shift Pagi</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Untuk laporan kasir yang buka di jam pagi, biasanya diinput setelah toko tutup atau
              serah terima ke shift berikutnya.
            </p>
          </div>
          <div className="rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#42A5F5] to-[#0A84FF] text-white shadow-sm">
              <CloudSun className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </span>
            <p className="text-[14px] font-semibold text-foreground">Shift Siang</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Untuk laporan kasir yang buka di jam siang, biasanya diinput saat toko tutup di
              penghujung hari.
            </p>
          </div>
        </div>
      </section>

      {/* Langkah-langkah: timeline vertikal, bukan badge angka menumpuk di atas ikon */}
      <section className="mb-8">
        <SectionLabel>Langkah Input Laporan</SectionLabel>
        <div className="rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
          {LANGKAH_INPUT.map((step, i) => {
            const isLast = i === LANGKAH_INPUT.length - 1;
            return (
              <div key={step.title} className="flex gap-4">
                {/* Kolom ikon + garis penghubung */}
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-[19px] w-[19px]" strokeWidth={2.1} />
                  </span>
                  {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
                </div>

                {/* Konten */}
                <div className={`min-w-0 ${isLast ? "pb-0.5" : "pb-6"}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[15px] font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mengelola riwayat */}
      <section className="mb-8">
        <SectionLabel>Mengelola Laporan yang Sudah Diinput</SectionLabel>
        <div className="flex gap-3 rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <History className="h-[19px] w-[19px]" strokeWidth={2.1} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-foreground">Tab Riwayat</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Semua laporan yang pernah diinput tersimpan di sini. Gunakan filter Pagi/Siang dan
              tombol urutkan (tanggal atau nominal) untuk mencari laporan tertentu dengan cepat.
              Tap salah satu laporan untuk melihat detail lengkap. Di halaman detail, foto struk
              bisa di-tap untuk dilihat penuh layar dan diunduh, dan tersedia ikon pensil untuk
              mengedit atau tombol hapus kalau laporan perlu dibatalkan.
            </p>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-8">
        <SectionLabel>Tips Supaya Laporan Rapi</SectionLabel>
        <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
          {TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <p className="text-[13px] leading-relaxed text-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bantuan lanjutan */}
      <div className="flex items-start gap-3 rounded-card bg-primary/8 p-4">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2.1} />
        <p className="text-[13px] leading-relaxed text-foreground">
          Masih bingung atau menemukan kendala saat input laporan? Cek halaman{" "}
          <span className="font-semibold">FAQ</span> atau kirim laporan lewat menu{" "}
          <span className="font-semibold">Laporkan Masalah</span>.
        </p>
      </div>
    </main>
  );
}