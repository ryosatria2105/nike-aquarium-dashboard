const JAKARTA_TZ = "Asia/Jakarta";

// Format Date jadi "yyyy-MM-dd" berdasarkan komponen UTC-nya.
// PENTING: kolom `tanggal` di DB adalah @db.Date murni (tanpa jam), dan
// Prisma selalu merepresentasikannya sebagai Date object pada UTC midnight
// kalender tsb. Jadi WAJIB dibaca lewat getUTC*(), bukan getFullYear()/
// getMonth() biasa (itu local time server — bisa beda hari kalau server
// jalan di timezone lain, misal Vercel yang default UTC).
export function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dateKeyToUTCDate(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

// "Hari ini" menurut kalender Asia/Jakarta — bukan menurut timezone server.
export function getJakartaTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getJakartaTodayUTCDate(): Date {
  return dateKeyToUTCDate(getJakartaTodayKey());
}

// Senin sebagai awal minggu (konvensi Indonesia).
export function startOfWeekUTC(date: Date): Date {
  const day = date.getUTCDay(); // 0=Minggu, 1=Senin, ...
  const diff = day === 0 ? 6 : day - 1;
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - diff);
  return result;
}

export function startOfMonthUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addDaysUTC(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

export function addMonthsUTC(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

const MONTH_LABELS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// "2026-07"
export function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

// "2026-07" -> Date UTC tanggal 1 bulan tsb
export function monthKeyToUTCDate(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y || 1970, (m || 1) - 1, 1));
}

// "2026-07" -> "Juli 2026"
export function monthLabelID(date: Date): string {
  return `${MONTH_LABELS_ID[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function daysInMonthUTC(monthStart: Date): number {
  return new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)
  ).getUTCDate();
}