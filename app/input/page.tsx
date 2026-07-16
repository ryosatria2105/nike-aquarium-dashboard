"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, Sunrise, Sun } from "lucide-react";import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const NAMA_PEGAWAI_STORAGE_KEY = "omzet:nama-pegawai";

type Shift = "pagi" | "siang";
type SlotKey = "foto1" | "foto2";

function todayLocalISODate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface FormErrors {
  tanggal?: string;
  namaPegawai?: string;
  nominalMesin?: string;
  nominalTunai?: string;
  foto?: string;
}

interface PhotoSlot {
  file: File | null;
  previewUrl: string | null;
}

export default function InputOmzetPage() {
  const toast = useToast();
  const fileInputRefs = {
    foto1: useRef<HTMLInputElement>(null),
    foto2: useRef<HTMLInputElement>(null),
  };

  const [tanggal, setTanggal] = useState(todayLocalISODate());
  const [shift, setShift] = useState<Shift>("pagi");
  const [namaPegawai, setNamaPegawai] = useState("");
  const [nominalMesin, setNominalMesin] = useState<number | null>(null);
  const [nominalTunai, setNominalTunai] = useState<number | null>(null);
  const [catatan, setCatatan] = useState("");

  const [photos, setPhotos] = useState<Record<SlotKey, PhotoSlot>>({
    foto1: { file: null, previewUrl: null },
    foto2: { file: null, previewUrl: null },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle");

  const isSubmitting = stage !== "idle";

  useEffect(() => {
    const saved = window.localStorage.getItem(NAMA_PEGAWAI_STORAGE_KEY);
    if (saved) setNamaPegawai(saved);
  }, []);

  useEffect(() => {
    return () => {
      if (photos.foto1.previewUrl) URL.revokeObjectURL(photos.foto1.previewUrl);
      if (photos.foto2.previewUrl) URL.revokeObjectURL(photos.foto2.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileSelect(slot: SlotKey, selected: File | undefined) {
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setErrors((prev) => ({ ...prev, foto: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP." }));
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setErrors((prev) => ({ ...prev, foto: "Ukuran file terlalu besar. Maksimal 5MB." }));
      return;
    }

    setPhotos((prev) => {
      if (prev[slot].previewUrl) URL.revokeObjectURL(prev[slot].previewUrl!);
      return { ...prev, [slot]: { file: selected, previewUrl: URL.createObjectURL(selected) } };
    });
    setErrors((prev) => ({ ...prev, foto: undefined }));
  }

  function removeFile(slot: SlotKey) {
    setPhotos((prev) => {
      if (prev[slot].previewUrl) URL.revokeObjectURL(prev[slot].previewUrl!);
      return { ...prev, [slot]: { file: null, previewUrl: null } };
    });
    const ref = fileInputRefs[slot].current;
    if (ref) ref.value = "";
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!tanggal) next.tanggal = "Tanggal wajib diisi.";
    if (!namaPegawai.trim()) next.namaPegawai = "Nama pegawai wajib diisi.";
    if (nominalMesin == null || nominalMesin <= 0) {
      next.nominalMesin = "Nominal omzet wajib diisi dan lebih dari 0.";
    }
    if (nominalTunai == null || nominalTunai < 0) {
      next.nominalTunai = "Nominal tunai wajib diisi.";
    }
    if (!photos.foto1.file) next.foto = "Minimal 1 foto struk wajib diupload.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function resetForm() {
    setTanggal(todayLocalISODate());
    setShift("pagi");
    setNominalMesin(null);
    setNominalTunai(null);
    setCatatan("");
    removeFile("foto1");
    removeFile("foto2");
    setErrors({});
  }

  async function uploadOne(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal upload foto.");
    return json.url as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    try {
      setStage("uploading");
      const fotoStrukUrl = await uploadOne(photos.foto1.file as File);
      const fotoStruk2Url = photos.foto2.file ? await uploadOne(photos.foto2.file) : undefined;

      setStage("saving");
      const saveRes = await fetch("/api/omzet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal,
          shift,
          nominalMesin,
          nominalTunai,
          fotoStrukUrl,
          fotoStruk2Url,
          namaPegawai: namaPegawai.trim(),
          catatan: catatan.trim() || undefined,
        }),
      });
      const saveJson = await saveRes.json();

      if (!saveRes.ok) {
        toast.error(saveJson.error ?? "Gagal menyimpan data omzet.");
        setStage("idle");
        return;
      }

      window.localStorage.setItem(NAMA_PEGAWAI_STORAGE_KEY, namaPegawai.trim());
      toast.success("Omzet berhasil disimpan.");
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setStage("idle");
    }
  }

  function renderPhotoSlot(slot: SlotKey, label: string, required: boolean) {
    const { previewUrl } = photos[slot];
    return (
      <div className="flex-1">
        <p className="mb-2 text-[13px] font-medium text-muted">
          {label} {!required && <span className="font-normal">(opsional)</span>}
        </p>
        {previewUrl ? (
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeFile(slot)}
              aria-label="Hapus foto"
              className="ios-press absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={slot}
            className="ios-press flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface-secondary text-muted active:text-primary"
          >
            <Camera className="h-5 w-5" />
            <span className="text-[12px]">Tambah foto</span>
          </label>
        )}
        <input
          ref={fileInputRefs[slot]}
          id={slot}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={(e) => handleFileSelect(slot, e.target.files?.[0])}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 sm:pt-12">
      <h1 className="ios-large-title mb-1 text-foreground">Input Laporan Shift</h1>
      <p className="mb-6 text-[15px] text-muted">
        Isi sesuai laporan mesin kasir setelah shift selesai.
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <FormField label="Tanggal" htmlFor="tanggal" error={errors.tanggal} required>
            <input
              id="tanggal"
              type="date"
              value={tanggal}
              max={todayLocalISODate()}
              onChange={(e) => setTanggal(e.target.value)}
              aria-invalid={!!errors.tanggal}
              className="font-tabular h-[52px] w-full rounded-2xl bg-surface-secondary px-4 text-[17px] text-foreground outline-none ring-2 ring-transparent transition-shadow focus:ring-primary/60"
            />
          </FormField>

          <FormField label="Shift" htmlFor="shift">
            <SegmentedControl<Shift>
              value={shift}
              onChange={setShift}
         options={[
                { value: "pagi", label: "Pagi", icon: <Sunrise className="h-4 w-4" /> },
                { value: "siang", label: "Siang", icon: <Sun className="h-4 w-4" /> },
              ]}
            />
          </FormField>

          <FormField label="Nama Pegawai" htmlFor="namaPegawai" error={errors.namaPegawai} required>
            <input
              id="namaPegawai"
              type="text"
              value={namaPegawai}
              onChange={(e) => setNamaPegawai(e.target.value)}
              placeholder="cth. Nama Pegawai"
              aria-invalid={!!errors.namaPegawai}
              className="h-[52px] w-full rounded-2xl bg-surface-secondary px-4 text-[17px] text-foreground outline-none ring-2 ring-transparent transition-shadow focus:ring-primary/60"
            />
          </FormField>

          <FormField
            label="Total Uang Mesin"
            htmlFor="nominalMesin"
            error={errors.nominalMesin}
            hint="Sesuai layar/struk mesin kasir."
            required
          >
            <CurrencyInput
              id="nominalMesin"
              value={nominalMesin}
              onChange={setNominalMesin}
              placeholder="0"
              aria-invalid={!!errors.nominalMesin}
            />
          </FormField>

          <FormField label="Total Tunai" htmlFor="nominalTunai" error={errors.nominalTunai} required>
            <CurrencyInput
              id="nominalTunai"
              value={nominalTunai}
              onChange={setNominalTunai}
              placeholder="0"
              aria-invalid={!!errors.nominalTunai}
            />
          </FormField>

          <FormField label="Foto Bukti (maks. 2)" htmlFor="foto1" error={errors.foto} required>
            <div className="flex gap-3">
              {renderPhotoSlot("foto1", "Struk", true)}
              {renderPhotoSlot("foto2", "Tambahan", false)}
            </div>
          </FormField>

          <FormField label="Catatan" htmlFor="catatan" hint="Opsional">
            <textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="cth. jika uang tunai lebih/kurang, tulis alasannya di sini "
              className="w-full resize-none rounded-2xl bg-surface-secondary px-4 py-3 text-[17px] text-foreground outline-none ring-2 ring-transparent transition-shadow focus:ring-primary/60"
            />
          </FormField>

          <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
            {stage === "uploading" && "Mengupload foto..."}
            {stage === "saving" && "Menyimpan data..."}
            {stage === "idle" && "Simpan Laporan"}
          </Button>
        </form>
      </Card>
    </main>
  );
}