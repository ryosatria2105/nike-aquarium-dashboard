-- Hapus partial unique index lama yang cuma berdasarkan tanggal
DROP INDEX IF EXISTS "omzet_entries_tanggal_active_unique";

-- Partial unique index baru: 1 kombinasi (tanggal, shift) hanya boleh
-- punya 1 entry AKTIF (belum di-soft-delete).
CREATE UNIQUE INDEX "omzet_entries_tanggal_shift_active_unique"
ON "omzet_entries" ("tanggal", "shift")
WHERE "deleted_at" IS NULL;