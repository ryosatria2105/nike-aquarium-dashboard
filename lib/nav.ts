export type AppMode = "pegawai" | "owner";
export type TabPage = "dashboard" | "riwayat" | "statistik" | "menu" | "input";

/**
 * Menentukan tujuan tombol back di AppBar, tergantung mode aktif.
 *
 * Mode Owner: Dashboard adalah "home" mode ini — semua halaman lain
 * (Riwayat, Statistik, Menu, Input) kembali ke Dashboard, dan Dashboard
 * sendiri kembali ke halaman pilih-mode (/).
 *
 * Mode Pegawai: Riwayat adalah "home" mode ini — Input dan Menu kembali
 * ke Riwayat, dan Riwayat sendiri kembali ke halaman pilih-mode (/).
 */
export function getBackHref(mode: AppMode, page: TabPage): string {
  if (mode === "owner") {
    return page === "dashboard" ? "/" : "/dashboard";
  }
  return page === "riwayat" ? "/" : "/riwayat";
}