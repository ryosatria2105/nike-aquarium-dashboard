import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin } from "@/lib/pin";
import {
  createSessionToken,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from "@/lib/session";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pin = body?.pin;

  if (typeof pin !== "string" || pin.length === 0) {
    return NextResponse.json({ error: "PIN wajib diisi." }, { status: 400 });
  }

  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });

  if (!settings) {
    return NextResponse.json(
      { error: "PIN belum diatur. Hubungi administrator." },
      { status: 500 }
    );
  }

  if (settings.lockedUntil && settings.lockedUntil > new Date()) {
    const sisaMenit = Math.ceil((settings.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Terlalu banyak percobaan salah. Coba lagi dalam ${sisaMenit} menit.` },
      { status: 429 }
    );
  }

  const isValid = await verifyPin(pin, settings.pinHash);

  if (!isValid) {
    const newFailedAttempts = settings.failedAttempts + 1;
    const shouldLock = newFailedAttempts >= MAX_ATTEMPTS;

    await prisma.appSettings.update({
      where: { id: 1 },
      data: {
        failedAttempts: shouldLock ? 0 : newFailedAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null,
      },
    });

    if (shouldLock) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan salah. Coba lagi dalam ${LOCKOUT_MINUTES} menit.` },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "PIN salah.", sisaPercobaan: MAX_ATTEMPTS - newFailedAttempts },
      { status: 401 }
    );
  }

  // Skip write kalau memang gak ada yang perlu direset (kasus paling umum:
  // PIN benar di percobaan pertama) — 1 query DB lebih sedikit = lebih cepat.
  const needsReset = settings.failedAttempts !== 0 || settings.lockedUntil !== null;
  const resetPromise = needsReset
    ? prisma.appSettings.update({
        where: { id: 1 },
        data: { failedAttempts: 0, lockedUntil: null },
      })
    : Promise.resolve();

  // Hashing token & reset attempt dijalankan bersamaan (bukan berurutan)
  // karena keduanya independen — nyingkat waktu tunggu total.
  const [token] = await Promise.all([createSessionToken(), resetPromise]);
  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}