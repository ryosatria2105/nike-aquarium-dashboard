import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const omzetSchema = z.object({
  tanggal: z.coerce.date({ error: 'Tanggal wajib diisi.' }),
  shift: z.enum(['pagi', 'siang'], { error: 'Shift wajib dipilih.' }),
  nominalMesin: z.coerce
    .number({ error: 'Nominal omzet (mesin kasir) wajib diisi.' })
    .positive('Nominal omzet harus lebih dari 0.'),
  nominalTunai: z.coerce
    .number({ error: 'Nominal tunai wajib diisi.' })
    .nonnegative('Nominal tunai tidak boleh negatif.'),
  fotoStrukUrl: z
    .string({ error: 'Foto struk wajib diupload.' })
    .min(1, 'Foto struk wajib diupload.')
    .url('URL foto struk tidak valid.'),
  fotoStruk2Url: z.string().url().optional().nullable(),
  namaPegawai: z
    .string({ error: 'Nama pegawai wajib diisi.' })
    .trim()
    .min(1, 'Nama pegawai wajib diisi.'),
  catatan: z.string().trim().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = omzetSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal.', details: z.treeifyError(parsed.error) },
        { status: 400 }
      )
    }

    const { tanggal, shift, nominalMesin, nominalTunai, fotoStrukUrl, fotoStruk2Url, namaPegawai, catatan } =
      parsed.data

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.omzetEntry.create({
        data: {
          tanggal,
          shift,
          nominalMesin,
          nominalTunai,
          fotoStrukUrl,
          fotoStruk2Url: fotoStruk2Url || null,
          namaPegawai,
          catatan: catatan || null,
        },
      })

      await tx.omzetAuditLog.create({
        data: {
          entryId: created.id,
          action: 'created',
          changedBy: namaPegawai,
          oldValue: Prisma.JsonNull,
          newValue: JSON.parse(JSON.stringify(created)),
        },
      })

      return created
    })

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Sudah ada data omzet untuk tanggal dan shift ini. Edit data yang ada, jangan input dobel.' },
        { status: 409 }
      )
    }

    console.error('Create omzet error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan data.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const take = Math.min(Number(searchParams.get('take')) || 30, 100)
    const skip = Number(searchParams.get('skip')) || 0
    const shiftFilter = searchParams.get('shift')
    const sort = searchParams.get('sort') || 'tanggal_desc'

    const where = {
      deletedAt: null,
      ...(shiftFilter === 'pagi' || shiftFilter === 'siang'
        ? { shift: shiftFilter as 'pagi' | 'siang' }
        : {}),
    }

    const orderBy =
      sort === 'tanggal_asc'
        ? [{ tanggal: 'asc' as const }, { shift: 'asc' as const }]
        : sort === 'nominal_desc'
        ? [{ nominalMesin: 'desc' as const }]
        : sort === 'nominal_asc'
        ? [{ nominalMesin: 'asc' as const }]
        : [{ tanggal: 'desc' as const }, { shift: 'asc' as const }]

    const [entries, total] = await Promise.all([
      prisma.omzetEntry.findMany({ where, orderBy, take, skip }),
      prisma.omzetEntry.count({ where }),
    ])

    return NextResponse.json({ data: entries, total, take, skip })
  } catch (err) {
    console.error('List omzet error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data.' },
      { status: 500 }
    )
  }
}