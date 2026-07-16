import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

// Cuma Dashboard & Statistik yang butuh PIN. Riwayat dan Menu SENGAJA
// tetap terbuka (keputusan: Riwayat boleh diakses semua pegawai).
const PROTECTED_PATHS = ["/dashboard", "/statistik"];

// GET /api/dashboard nyuplai data agregat ke halaman Dashboard, jadi ikut
// diproteksi. GET & POST /api/omzet SENGAJA tidak termasuk (dipakai Input
// dan Riwayat, keduanya harus tetap bebas diakses).
const PROTECTED_API_PATTERNS = [
  { path: "/api/dashboard", methods: ["GET"] },
  { path: "/api/statistik", methods: ["GET"] }, // akan dipakai nanti
  { path: "/api/change-pin", methods: ["POST"] },
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedApi(pathname: string, method: string): boolean {
  return PROTECTED_API_PATTERNS.some(
    (rule) =>
      (pathname === rule.path || pathname.startsWith(`${rule.path}/`)) &&
      rule.methods.includes(method)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  const needsAuth = isProtectedPath(pathname) || isProtectedApi(pathname, method);
  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = await verifySessionToken(token);

  if (isValid) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Butuh verifikasi PIN." }, { status: 401 });
  }

  const loginUrl = new URL("/masuk", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/statistik",
    "/statistik/:path*",
    "/api/dashboard",
    "/api/dashboard/:path*",
    "/api/statistik",
    "/api/statistik/:path*",
    "/api/change-pin",
  ],
};