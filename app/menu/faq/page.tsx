"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  History,
  Plus,
  ShieldCheck,
  Info,
} from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_GROUPS: { title: string; icon: React.ElementType; items: FaqItem[] }[] = [
  {
    title: "Input Laporan",
    icon: ClipboardList,
    items: [
      {
        q: "Apa bedanya Total Uang Mesin dan Total Tunai?",
        a: "Total Uang Mesin adalah angka omzet resmi sesuai layar/struk mesin kasir, dan inilah yang dipakai sebagai acuan omzet di seluruh laporan & statistik. Total Tunai adalah hasil hitung fisik uang di laci — dipakai sebagai info pendukung untuk mengecek kecocokan kas, bukan sebagai angka omzet utama. Wajar kalau kedua angka ini sedikit berbeda.",
      },
      {
        q: "Berapa banyak foto struk yang bisa diupload?",
        a: "Maksimal 2 foto per laporan. Foto pertama wajib diisi (foto struk/laporan mesin kasir utama), foto kedua sifatnya opsional untuk bukti tambahan seperti struk tunai terpisah. Format yang didukung JPG, PNG, atau WEBP, dengan ukuran maksimal 5MB per foto.",
      },
      {
        q: "Kenapa 1 tanggal cuma bisa punya 1 laporan per shift?",
        a: "Supaya data tidak dobel atau rancu saat direkap. Sistem membatasi 1 kombinasi tanggal + shift hanya boleh punya 1 laporan aktif. Kalau ada kesalahan input atau perlu koreksi nominal untuk tanggal & shift yang sama, edit laporan yang sudah ada lewat halaman Riwayat — jangan input laporan baru untuk tanggal/shift yang sama.",
      },
      {
        q: "Apakah tanggal laporan bisa diisi untuk hari sebelumnya?",
        a: "Bisa. Tanggal otomatis terisi hari ini, tapi bisa diganti mundur kalau kamu baru sempat menginput laporan hari sebelumnya. Tanggal ke depan (belum terjadi) tidak bisa dipilih.",
      },
      {
        q: "Nama pegawai kok otomatis muncul lagi?",
        a: "Nama pegawai yang terakhir dipakai untuk input akan diingat otomatis di perangkat ini, supaya kamu tidak perlu mengetik ulang setiap kali input laporan baru. Kalau perangkat dipakai bergantian, cukup ganti nama sebelum menyimpan.",
      },
    ],
  },
  {
    title: "Riwayat & Edit Laporan",
    icon: History,
    items: [
      {
        q: "Bagaimana cara mengedit laporan yang salah input?",
        a: "Buka tab Riwayat, cari dan tap laporan yang mau diedit, lalu tap ikon pensil di pojok kanan atas halaman detail. Semua field termasuk foto struk bisa diubah, lalu tap Simpan Perubahan.",
      },
      {
        q: "Bagaimana cara melihat foto struk secara penuh atau mengunduhnya?",
        a: "Di halaman detail laporan, tap foto struk yang ingin dilihat. Foto akan terbuka layar penuh, dan tersedia tombol Unduh di pojok kanan atas untuk menyimpan foto ke perangkat.",
      },
      {
        q: "Apakah laporan yang dihapus benar-benar hilang dari sistem?",
        a: "Tidak. Laporan yang dihapus hanya disembunyikan dari tampilan (soft delete) — datanya tetap tersimpan di database untuk keperluan audit dan riwayat perubahan. Kalau laporan terhapus secara tidak sengaja, hubungi owner untuk pengecekan lebih lanjut.",
      },
      {
        q: "Bisa urutkan atau filter riwayat berdasarkan apa saja?",
        a: "Riwayat bisa difilter berdasarkan shift (Semua, Pagi, Siang), dan diurutkan berdasarkan Tanggal Terbaru, Tanggal Terlama, Nominal Tertinggi, atau Nominal Terendah lewat tombol urutkan di pojok kanan atas.",
      },
    ],
  },
  {
    title: "PIN & Keamanan",
    icon: ShieldCheck,
    items: [
      {
        q: "Kenapa Dashboard & Statistik butuh PIN, tapi Input Laporan tidak?",
        a: "Dashboard dan Statistik menampilkan ringkasan omzet keseluruhan toko, yang sifatnya lebih sensitif dan biasanya hanya perlu diakses owner. Karena itu kedua halaman ini dikunci PIN. Input Laporan tetap terbuka untuk semua pegawai karena memang dipakai setiap hari untuk mencatat hasil shift.",
      },
      {
        q: "Saya lupa PIN Dashboard, bagaimana solusinya?",
        a: "PIN tidak bisa dilihat ulang karena disimpan dalam bentuk terenkripsi (hash), hanya bisa diganti. Hubungi owner atau pemegang akses sebelumnya untuk melakukan reset PIN lewat menu Ganti PIN.",
      },
      {
        q: "Apa yang terjadi kalau salah memasukkan PIN berkali-kali?",
        a: "Untuk menjaga keamanan, sistem akan membatasi (mengunci sementara) percobaan PIN setelah beberapa kali salah berturut-turut. Tunggu beberapa saat lalu coba lagi.",
      },
    ],
  },
  {
    title: "Umum",
    icon: Info,
    items: [
      {
        q: "Apakah aplikasi ini butuh koneksi internet?",
        a: "Ya. Setiap laporan yang diinput langsung tersimpan ke server, jadi aplikasi membutuhkan koneksi internet aktif saat mengupload foto struk dan menyimpan data.",
      },
      {
        q: "Bagaimana cara mengganti tampilan terang/gelap?",
        a: "Buka menu Menu, lalu aktifkan atau nonaktifkan toggle Tema Aplikasi di bagian Preferensi. Perubahan tema tersimpan otomatis di perangkat.",
      },
      {
        q: "Punya kendala yang tidak tercantum di sini?",
        a: "Silakan hubungi pengembang lewat menu Laporkan Masalah — jelaskan kendala yang dialami sedetail mungkin (termasuk tangkapan layar bila perlu) supaya bisa ditindaklanjuti dengan cepat.",
      },
    ],
  },
];

function GroupLabel({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 px-1">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">{title}</p>
    </div>
  );
}

export default function FaqPage() {
  const router = useRouter();
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-10">
      <button
        onClick={() => router.back()}
        aria-label="Kembali"
        className="ios-press mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-foreground shadow-sm"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="ios-large-title mb-1 text-foreground">FAQ</h1>
      <p className="mb-8 text-[15px] leading-relaxed text-muted">
        Pertanyaan yang paling sering ditanyakan seputar pemakaian aplikasi.
      </p>

      {FAQ_GROUPS.map((group) => (
        <section key={group.title} className="mb-8">
          <GroupLabel icon={group.icon} title={group.title} />

          <div className="divide-y divide-border overflow-hidden rounded-card bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
            {group.items.map((item) => {
              const key = `${group.title}-${item.q}`;
              const open = openKey === key;
              return (
                <div key={key}>
                  <button
                    onClick={() => setOpenKey(open ? null : key)}
                    aria-expanded={open}
                    className="ios-press flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="flex-1 text-[14px] font-medium leading-snug text-foreground">
                      {item.q}
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                        open ? "bg-primary text-primary-foreground" : "bg-surface-secondary text-muted"
                      }`}
                    >
                      <Plus
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          open ? "rotate-45" : ""
                        }`}
                        strokeWidth={2.5}
                      />
                    </span>
                  </button>
                  {open && (
                    <p className="px-4 pb-4 text-[13px] leading-relaxed text-muted">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}