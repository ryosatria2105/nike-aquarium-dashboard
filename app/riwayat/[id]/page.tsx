"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, Pencil, Camera, X, Trash2, Sunrise, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ShiftBadge } from "@/components/ui/ShiftBadge";
import { PhotoViewer } from "@/components/ui/PhotoViewer";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah } from "@/lib/format";

type Shift = "pagi" | "siang";
type SlotKey = "foto1" | "foto2";

interface Entry {
  id: string;
  tanggal: string;
  shift: Shift;
  nominalMesin: string;
  nominalTunai: string;
  fotoStrukUrl: string;
  fotoStruk2Url: string | null;
  namaPegawai: string;
  catatan: string | null;
}

export default function DetailRiwayatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const fileInputRefs = {
    foto1: useRef<HTMLInputElement>(null),
    foto2: useRef<HTMLInputElement>(null),
  };

  const [entry, setEntry] = useState<Entry | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  const [tanggal, setTanggal] = useState("");
  const [shift, setShift] = useState<Shift>("pagi");
  const [nominalMesin, setNominalMesin] = useState<number | null>(null);
  const [nominalTunai, setNominalTunai] = useState<number | null>(null);
  const [namaPegawai, setNamaPegawai] = useState("");
  const [catatan, setCatatan] = useState("");
  const [newFiles, setNewFiles] = useState<Record<SlotKey, File | null>>({ foto1: null, foto2: null });
  const [previewUrls, setPreviewUrls] = useState<Record<SlotKey, string | null>>({
    foto1: null,
    foto2: null,
  });

  useEffect(() => {
    fetch(`/api/omzet/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setEntry(json.data);
          setTanggal(json.data.tanggal.slice(0, 10));
          setShift(json.data.shift);
          setNominalMesin(Number(json.data.nominalMesin));
          setNominalTunai(Number(json.data.nominalTunai));
          setNamaPegawai(json.data.namaPegawai);
          setCatatan(json.data.catatan ?? "");
        }
      });
  }, [id]);

  function handleFileSelect(slot: SlotKey, selected: File | undefined) {
    if (!selected) return;
    setPreviewUrls((prev) => {
      if (prev[slot]) URL.revokeObjectURL(prev[slot]!);
      return { ...prev, [slot]: URL.createObjectURL(selected) };
    });
    setNewFiles((prev) => ({ ...prev, [slot]: selected }));
  }

  async function uploadOne(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal upload foto.");
    return json.url as string;
  }

  async function handleSave() {
    if (!entry) return;
    setSaving(true);
    try {
      const fotoStrukUrl = newFiles.foto1 ? await uploadOne(newFiles.foto1) : undefined;
      const fotoStruk2Url = newFiles.foto2 ? await uploadOne(newFiles.foto2) : undefined;

      const res = await fetch(`/api/omzet/${id}`, {
        method: "PATCH",
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
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Gagal menyimpan perubahan.");
        setSaving(false);
        return;
      }

      setEntry(json.data);
      setMode("view");
      setNewFiles({ foto1: null, foto2: null });
      setPreviewUrls({ foto1: null, foto2: null });
      toast.success("Perubahan disimpan.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const res = await fetch(`/api/omzet/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Gagal menghapus data.");
      return;
    }
    toast.success("Data dihapus.");
    router.push("/riwayat");
  }

  if (!entry) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pt-8">
        <div className="h-64 animate-pulse rounded-card bg-surface-secondary" />
      </main>
    );
  }

  const photoList = [entry.fotoStrukUrl, entry.fotoStruk2Url].filter(Boolean) as string[];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-6">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => (mode === "edit" ? setMode("view") : router.push("/riwayat"))}
          aria-label="Kembali"
          className="ios-press flex h-9 w-9 items-center justify-center text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {mode === "view" && (
          <button
            onClick={() => setMode("edit")}
            aria-label="Edit"
            className="ios-press flex h-9 w-9 items-center justify-center text-primary"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {mode === "view" ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-bold text-foreground">
              {format(parseISO(entry.tanggal), "EEEE, d MMMM yyyy", { locale: idLocale })}
            </h1>
            <ShiftBadge shift={entry.shift} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
              <p className="text-[12px] text-muted">Total Mesin</p>
              <p className="font-tabular mt-1 text-[17px] font-semibold text-foreground">
                {formatRupiah(Number(entry.nominalMesin))}
              </p>
            </div>
            <div className="rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
              <p className="text-[12px] text-muted">Total Tunai</p>
              <p className="font-tabular mt-1 text-[17px] font-semibold text-foreground">
                {formatRupiah(Number(entry.nominalTunai))}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-muted">
              Foto Bukti {photoList.length > 1 ? `(${photoList.length})` : ""}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {photoList.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setViewerSrc(url)}
                  className="ios-press aspect-square overflow-hidden rounded-card"
                  aria-label={`Lihat foto ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto struk ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-card bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
            <p className="text-[12px] text-muted">Pegawai</p>
            <p className="mt-0.5 text-[15px] font-medium text-foreground">{entry.namaPegawai}</p>
            {entry.catatan && (
              <>
                <p className="mt-3 text-[12px] text-muted">Catatan</p>
                <p className="mt-0.5 whitespace-pre-wrap text-[14px] text-foreground">
                  {entry.catatan}
                </p>
              </>
            )}
          </div>

          <button
            onClick={handleDelete}
            className={`ios-press flex items-center justify-center gap-2 rounded-card py-3.5 text-[15px] font-medium ${
              confirmDelete ? "bg-danger text-white" : "bg-danger/10 text-danger"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            {confirmDelete ? "Tap sekali lagi untuk konfirmasi" : "Hapus Data"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <FormField label="Tanggal" htmlFor="edit-tanggal">
            <input
              id="edit-tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="font-tabular h-[52px] w-full rounded-2xl bg-surface-secondary px-4 text-[17px] text-foreground outline-none"
            />
          </FormField>

          <FormField label="Shift" htmlFor="edit-shift">
            <SegmentedControl<Shift>
              value={shift}
              onChange={setShift}
              options={[
                { value: "pagi", label: "Pagi", icon: <Sunrise className="h-4 w-4" /> },
                { value: "siang", label: "Siang", icon: <Sun className="h-4 w-4" /> },
              ]}
            />
          </FormField>

          <FormField label="Total Mesin" htmlFor="edit-mesin">
            <CurrencyInput id="edit-mesin" value={nominalMesin} onChange={setNominalMesin} />
          </FormField>

          <FormField label="Total Tunai" htmlFor="edit-tunai">
            <CurrencyInput id="edit-tunai" value={nominalTunai} onChange={setNominalTunai} />
          </FormField>

          <FormField label="Foto Bukti" htmlFor="edit-foto1">
            <div className="flex gap-3">
              {(["foto1", "foto2"] as SlotKey[]).map((slot, i) => {
                const existingUrl = i === 0 ? entry.fotoStrukUrl : entry.fotoStruk2Url;
                const shown = previewUrls[slot] ?? existingUrl;
                return (
                  <div key={slot} className="flex-1">
                    {shown ? (
                      <div className="relative aspect-square overflow-hidden rounded-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shown} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                        <label
                          htmlFor={slot}
                          className="ios-press absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white"
                        >
                          <Camera className="h-3 w-3" /> Ganti
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor={slot}
                        className="ios-press flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface-secondary text-muted"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="text-[12px]">Tambah</span>
                      </label>
                    )}
                    <input
                      ref={fileInputRefs[slot]}
                      id={slot}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileSelect(slot, e.target.files?.[0])}
                      className="hidden"
                    />
                  </div>
                );
              })}
            </div>
          </FormField>

          <FormField label="Nama Pegawai" htmlFor="edit-nama">
            <input
              id="edit-nama"
              type="text"
              value={namaPegawai}
              onChange={(e) => setNamaPegawai(e.target.value)}
              className="h-[52px] w-full rounded-2xl bg-surface-secondary px-4 text-[17px] text-foreground outline-none"
            />
          </FormField>

          <FormField label="Catatan" htmlFor="edit-catatan" hint="Opsional">
            <textarea
              id="edit-catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-2xl bg-surface-secondary px-4 py-3 text-[17px] text-foreground outline-none"
            />
          </FormField>

          <Button onClick={handleSave} isLoading={saving} size="lg" className="w-full">
            Simpan Perubahan
          </Button>
        </div>
      )}

      {viewerSrc && (
        <PhotoViewer src={viewerSrc} alt="Foto struk" onClose={() => setViewerSrc(null)} />
      )}
    </main>
  );
}