import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const updateSchema = z.object({
  tanggal: z.coerce.date({ error: 'Tanggal wajib diisi.' }),
  shift: z.enum(['pagi', 'siang'], { error: 'Shift wajib dipilih.' }),
  nominalMesin: z.coerce.number().positive('Nominal mesin harus lebih dari 0.'),
  nominalTunai: z.coerce.number().nonnegative('Nominal tunai tidak boleh negatif.'),
  fotoStrukUrl: z.string().url().optional(),
  fotoStruk2Url: z.string().url().optional().nullable(),
  namaPegawai: z.string().trim().min(1, 'Nama pegawai wajib diisi.'),
  catatan: z.string().trim().optional().nullable(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const entry = await prisma.omzetEntry.findFirst({
    where: { id, deletedAt: null },
  })
  if (!entry) {
    return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 })
  }
  return NextResponse.json({ data: entry })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal.', details: z.treeifyError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.omzetEntry.findFirst({ where: { id, deletedAt: null } })
    if (!existing) {
      return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 })
    }

    const { tanggal, shift, nominalMesin, nominalTunai, fotoStrukUrl, fotoStruk2Url, namaPegawai, catatan } =
      parsed.data

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.omzetEntry.update({
        where: { id },
        data: {
          tanggal,
          shift,
          nominalMesin,
          nominalTunai,
          fotoStrukUrl: fotoStrukUrl ?? existing.fotoStrukUrl,
          fotoStruk2Url: fotoStruk2Url !== undefined ? fotoStruk2Url : existing.fotoStruk2Url,
          namaPegawai,
          catatan: catatan || null,
        },
      })

      await tx.omzetAuditLog.create({
        data: {
          entryId: id,
          action: 'updated',
          changedBy: namaPegawai,
          oldValue: JSON.parse(JSON.stringify(existing)),
          newValue: JSON.parse(JSON.stringify(result)),
        },
      })

      return result
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Sudah ada data untuk tanggal dan shift itu.' },
        { status: 409 }
      )
    }
    console.error('Update omzet error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan saat menyimpan.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await prisma.omzetEntry.findFirst({ where: { id, deletedAt: null } })
    if (!existing) {
      return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.omzetEntry.update({ where: { id }, data: { deletedAt: new Date() } })
      await tx.omzetAuditLog.create({
        data: {
          entryId: id,
          action: 'deleted',
          changedBy: existing.namaPegawai,
          oldValue: JSON.parse(JSON.stringify(existing)),
          newValue: Prisma.JsonNull,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete omzet error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghapus.' }, { status: 500 })
  }
}