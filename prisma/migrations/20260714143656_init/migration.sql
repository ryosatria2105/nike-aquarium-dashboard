-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('created', 'updated', 'deleted');

-- CreateTable
CREATE TABLE "omzet_entries" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "nominal_mesin" DECIMAL(15,2) NOT NULL,
    "nominal_tunai" DECIMAL(15,2) NOT NULL,
    "foto_struk_url" TEXT NOT NULL,
    "nama_pegawai" TEXT NOT NULL,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "omzet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "omzet_audit_log" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "changed_by" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "omzet_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pin_hash" TEXT NOT NULL,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "omzet_entries_tanggal_idx" ON "omzet_entries"("tanggal");

-- CreateIndex
CREATE INDEX "omzet_entries_deleted_at_idx" ON "omzet_entries"("deleted_at");

-- CreateIndex
CREATE INDEX "omzet_audit_log_entry_id_idx" ON "omzet_audit_log"("entry_id");

-- AddForeignKey
ALTER TABLE "omzet_audit_log" ADD CONSTRAINT "omzet_audit_log_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "omzet_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
