import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  toDateKey,
  getJakartaTodayUTCDate,
  startOfWeekUTC,
  startOfMonthUTC,
  addDaysUTC,
  addMonthsUTC,
  toMonthKey,
  monthKeyToUTCDate,
  monthLabelID,
  daysInMonthUTC,
} from "@/lib/date";

const MONTH_OPTIONS_COUNT = 12;
const RECENT_ENTRIES_LIMIT = 5;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const today = getJakartaTodayUTCDate();
    const currentMonthStart = startOfMonthUTC(today);

    const requestedMonth = searchParams.get("month");
    const monthStart = requestedMonth ? monthKeyToUTCDate(requestedMonth) : currentMonthStart;
    const monthEnd = addMonthsUTC(monthStart, 1); // exclusive
    const prevMonthStart = addMonthsUTC(monthStart, -1);

    const startOfWeek = startOfWeekUTC(today);
    const todayKey = toDateKey(today);

    // Entry per hari+shift maksimal 1 per kombinasi (unique constraint aktif),
    // jadi volume data toko single-lokasi ini realistis kecil. Ambil semua lalu
    // agregasi di JS — lebih simpel & aman dibanding raw SQL GROUP BY (menghindari
    // isu serialisasi Decimal & timezone di level SQL). Kalau nanti scale ke
    // multi-toko/multi-tahun, ganti ke agregasi SQL.
    const entries = await prisma.omzetEntry.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        tanggal: true,
        shift: true,
        nominalMesin: true,
        namaPegawai: true,
      },
      orderBy: { tanggal: "asc" },
    });

    const byDateKey = new Map<string, number>();
    let allTimeTotal = 0;
    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;
    let prevMonthTotal = 0;
    const shiftBreakdown = { pagi: 0, siang: 0 };
    const todayShiftStatus = { pagi: false, siang: false };

    for (const entry of entries) {
      const amount = Number(entry.nominalMesin);
      const key = toDateKey(entry.tanggal);
      byDateKey.set(key, (byDateKey.get(key) ?? 0) + amount);
      allTimeTotal += amount;

      const d = new Date(`${key}T00:00:00.000Z`);
      if (d >= startOfWeek) weekTotal += amount;

      if (key === todayKey) {
        todayTotal += amount;
        if (entry.shift === "pagi") todayShiftStatus.pagi = true;
        if (entry.shift === "siang") todayShiftStatus.siang = true;
      }

      if (d >= monthStart && d < monthEnd) {
        monthTotal += amount;
        shiftBreakdown[entry.shift] += amount;
      }

      if (d >= prevMonthStart && d < monthStart) {
        prevMonthTotal += amount;
      }
    }

    // Sparkline hero card: total per hari sepanjang bulan yang dipilih.
    const days = daysInMonthUTC(monthStart);
    const dailyChart = Array.from({ length: days }, (_, i) => {
      const d = addDaysUTC(monthStart, i);
      const key = toDateKey(d);
      return { date: key, total: byDateKey.get(key) ?? 0 };
    });

    const monthChangePercent =
      prevMonthTotal > 0 ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100 : null;

    const recentEntries = entries
      .filter((e) => {
        const key = toDateKey(e.tanggal);
        const d = new Date(`${key}T00:00:00.000Z`);
        return d >= monthStart && d < monthEnd;
      })
      .sort((a, b) => {
        const ta = new Date(a.tanggal).getTime();
        const tb = new Date(b.tanggal).getTime();
        if (tb !== ta) return tb - ta;
        return a.shift === b.shift ? 0 : a.shift === "siang" ? -1 : 1;
      })
      .slice(0, RECENT_ENTRIES_LIMIT)
      .map((e) => ({
        id: e.id,
        tanggal: e.tanggal,
        shift: e.shift,
        nominalMesin: e.nominalMesin,
        namaPegawai: e.namaPegawai,
      }));

    const availableMonths = Array.from({ length: MONTH_OPTIONS_COUNT }, (_, idx) => {
      const d = addMonthsUTC(currentMonthStart, -idx);
      return { key: toMonthKey(d), label: monthLabelID(d) };
    });

    return NextResponse.json({
      month: toMonthKey(monthStart),
      monthLabel: monthLabelID(monthStart),
      isCurrentMonth: toMonthKey(monthStart) === toMonthKey(currentMonthStart),
      monthTotal,
      prevMonthTotal,
      monthChangePercent,
      todayTotal,
      weekTotal,
      allTimeTotal,
      totalDaysRecorded: byDateKey.size,
      dailyChart,
      shiftBreakdown,
      todayShiftStatus,
      recentEntries,
      availableMonths,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data dashboard." },
      { status: 500 }
    );
  }
}