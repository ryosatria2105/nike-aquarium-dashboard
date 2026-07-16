import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin, verifyPin } from "@/lib/pin";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Belum terverifikasi." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { pinLama, pinBaru } = body || {};

  if (typeof pinBaru !== "string" || !/^\d{4}$/.test(pinBaru)) {
    return NextResponse.json(
      { error: "PIN baru harus berupa 4 digit angka." },
      { status: 400 }
    );
  }

  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    return NextResponse.json({ error: "PIN belum pernah diatur." }, { status: 400 });
  }

  const isOldPinValid = await verifyPin(pinLama || "", settings.pinHash);
  if (!isOldPinValid) {
    return NextResponse.json({ error: "PIN lama salah." }, { status: 401 });
  }

  const newHash = await hashPin(pinBaru);
  await prisma.appSettings.update({
    where: { id: 1 },
    data: { pinHash: newHash, failedAttempts: 0, lockedUntil: null },
  });

  return NextResponse.json({ success: true });
}