-- Partial unique index: 1 tanggal hanya boleh punya 1 entry AKTIF
-- (belum di-soft-delete). Entry yang sudah di-soft-delete tidak
-- memblokir tanggal yang sama dipakai lagi.
CREATE UNIQUE INDEX "omzet_entries_tanggal_active_unique"
ON "omzet_entries" ("tanggal")
WHERE "deleted_at" IS NULL;