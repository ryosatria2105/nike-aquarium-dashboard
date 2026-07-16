import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  toDateKey,
  getJakartaTodayUTCDate,
  startOfMonthUTC,
  addMonthsUTC,
  addDaysUTC,
  toMonthKey,
  monthKeyToUTCDate,
  monthLabelID,
  daysInMonthUTC,
} from "@/lib/date";

const MONTH_OPTIONS_COUNT = 12;
const TOP_LIMIT = 5;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const today = getJakartaTodayUTCDate();
    const currentMonthStart = startOfMonthUTC(today);

    const requestedMonth = searchParams.get("month");
    const monthStart = requestedMonth ? monthKeyToUTCDate(requestedMonth) : currentMonthStart;
    const monthEnd = addMonthsUTC(monthStart, 1);
    const prevMonthStart = addMonthsUTC(monthStart, -1);

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
    const shiftBreakdown = { pagi: 0, siang: 0 };
    let monthTotal = 0;
    let prevMonthTotal = 0;

    const monthEntries: typeof entries = [];

    for (const entry of entries) {
      const amount = Number(entry.nominalMesin);
      const key = toDateKey(entry.tanggal);
      const d = new Date(`${key}T00:00:00.000Z`);

      if (d >= monthStart && d < monthEnd) {
        monthTotal += amount;
        shiftBreakdown[entry.shift] += amount;
        byDateKey.set(key, (byDateKey.get(key) ?? 0) + amount);
        monthEntries.push(entry);
      }

      if (d >= prevMonthStart && d < monthStart) {
        prevMonthTotal += amount;
      }
    }

    const totalDaysWithData = byDateKey.size;
    const avgDaily = totalDaysWithData > 0 ? monthTotal / totalDaysWithData : 0;

    let bestDay: { date: string; total: number } | null = null;
    let worstDay: { date: string; total: number } | null = null;
    for (const [date, total] of byDateKey.entries()) {
      if (!bestDay || total > bestDay.total) bestDay = { date, total };
      if (!worstDay || total < worstDay.total) worstDay = { date, total };
    }

    const growthPercent =
      prevMonthTotal > 0 ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100 : null;

    // Tren harian — tiap hari dalam bulan yang dipilih.
    const daysCount = daysInMonthUTC(monthStart);
    const dailyTrend = Array.from({ length: daysCount }, (_, i) => {
      const d = addDaysUTC(monthStart, i);
      const key = toDateKey(d);
      return { date: key, total: byDateKey.get(key) ?? 0 };
    });

    // Top 5 tertinggi & terendah dalam bulan yang dipilih.
    const sorted = [...monthEntries].sort(
      (a, b) => Number(b.nominalMesin) - Number(a.nominalMesin)
    );
    const mapEntry = (e: (typeof monthEntries)[number]) => ({
      id: e.id,
      tanggal: e.tanggal,
      shift: e.shift,
      namaPegawai: e.namaPegawai,
      nominalMesin: e.nominalMesin,
    });
    const topHighest = sorted.slice(0, TOP_LIMIT).map(mapEntry);
    const topLowest = sorted
      .slice(-TOP_LIMIT)
      .reverse()
      .map(mapEntry);

    const availableMonths = Array.from({ length: MONTH_OPTIONS_COUNT }, (_, idx) => {
      const d = addMonthsUTC(currentMonthStart, -idx);
      return { key: toMonthKey(d), label: monthLabelID(d) };
    });

    return NextResponse.json({
      month: toMonthKey(monthStart),
      monthLabel: monthLabelID(monthStart),
      availableMonths,
      monthTotal,
      avgDaily,
      bestDay,
      worstDay,
      growthPercent,
      shiftBreakdown,
      dailyTrend,
      topHighest,
      topLowest,
    });
  } catch (err) {
    console.error("Statistik error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data statistik." },
      { status: 500 }
    );
  }
}