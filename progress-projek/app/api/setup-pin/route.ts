import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/pin";
import {
  createSessionToken,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pin = body?.pin;

if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {    return NextResponse.json(
      { error: "PIN harus berupa 4-6 digit angka." },
      { status: 400 }
    );
  }

  const existing = await prisma.appSettings.findUnique({ where: { id: 1 } });
  if (existing) {
    return NextResponse.json(
      { error: "PIN sudah pernah diatur sebelumnya. Gunakan menu Ganti PIN." },
      { status: 403 }
    );
  }

  const pinHash = await hashPin(pin);
  await prisma.appSettings.create({ data: { id: 1, pinHash } });

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}