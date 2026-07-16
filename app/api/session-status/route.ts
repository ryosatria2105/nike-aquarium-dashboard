import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

// Endpoint ini CUMA buat kebutuhan tampilan (nentuin TabBar 3-tab atau
// 5-tab). Bukan boundary keamanan — middleware.ts yang jadi penegaknya.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = await verifySessionToken(token);
  return NextResponse.json({ authenticated });
}