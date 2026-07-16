import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface EntrySnapshot {
  tanggal?: string;
  shift?: "pagi" | "siang";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const take = Math.min(Number(searchParams.get("take")) || 20, 50);

    const logs = await prisma.omzetAuditLog.findMany({
      orderBy: { changedAt: "desc" },
      take,
    });

    const data = logs.map((log) => {
      const snapshot = (log.action === "deleted" ? log.oldValue : log.newValue) as
        | EntrySnapshot
        | null;

      return {
        id: log.id,
        action: log.action,
        changedBy: log.changedBy,
        changedAt: log.changedAt,
        entryId: log.entryId,
        tanggal: snapshot?.tanggal ?? null,
        shift: snapshot?.shift ?? null,
      };
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Audit log error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil aktivitas." },
      { status: 500 }
    );
  }
}