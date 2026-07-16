"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  KeyRound,
  Sun,
  Moon,
  Info,
  HelpCircle,
  BookOpen,
  MessageCircleWarning,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { PinPad } from "@/components/ui/PinPad";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";

const LAPORKAN_MASALAH_URL =
  "https://wa.me/6287870165060?text=" +
  encodeURIComponent("Halo, saya ingin melaporkan masalah pada aplikasi Nike Aquarium: ");

function MenuRow({
  icon,
  label,
  value,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`ios-press flex w-full items-center gap-3 px-4 py-3.5 text-left ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <span className="flex h-7 w-7 items-center justify-center text-muted">{icon}</span>
      <span className="flex-1 text-[15px] text-foreground">{label}</span>
      {value && <span className="text-[14px] text-muted">{value}</span>}
      {onClick && !disabled && <ChevronRight className="h-4 w-4 text-muted" />}
    </button>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {title && (
        <p className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wide text-muted">
          {title}
        </p>
      )}
      <div className="divide-y divide-border rounded-card bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
        {children}
      </div>
    </div>
  );
}

export default function MenuPage() {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<"pegawai" | "owner">("pegawai");
  const [dark, setDark] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [pinStep, setPinStep] = useState<"old" | "new" | "confirm">("old");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("omzet:mode");
    if (saved === "owner" || saved === "pegawai") setMode(saved);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const isOwner = mode === "owner";

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("omzet:theme", next ? "dark" : "light");
  }

  function startChangePin() {
    setChangingPin(true);
    setPinStep("old");
    setPinInput("");
    setOldPin("");
    setNewPin("");
    setPinError(null);
  }

  async function handlePinInputChange(v: string) {
    setPinInput(v);
    if (v.length !== 4) return;

    if (pinStep === "old") {
      setOldPin(v);
      setPinInput("");
      setPinStep("new");
      return;
    }
    if (pinStep === "new") {
      setNewPin(v);
      setPinInput("");
      setPinStep("confirm");
      return;
    }
    if (pinStep === "confirm") {
      if (v !== newPin) {
        setPinError("PIN baru tidak cocok. Coba lagi dari awal.");
        setPinStep("new");
        setPinInput("");
        setNewPin("");
        return;
      }
      const res = await fetch("/api/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinLama: oldPin, pinBaru: v }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengganti PIN.");
        setChangingPin(false);
        return;
      }
      toast.success("PIN berhasil diganti.");
      setChangingPin(false);
    }
  }

  if (changingPin) {
    const title =
      pinStep === "old" ? "Masukkan PIN Lama" : pinStep === "new" ? "PIN Baru" : "Ulangi PIN Baru";
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-6 pt-16">
        <h1 className="mb-1 text-[20px] font-semibold text-foreground">{title}</h1>
        <p className="mb-10 text-[14px] text-muted">Ganti PIN akses Dashboard &amp; Statistik</p>
        <PinPad value={pinInput} onChange={handlePinInputChange} error={!!pinError} />
        <p className="mt-8 h-5 text-[13px] text-danger">{pinError}</p>
        <button
          onClick={() => setChangingPin(false)}
          className="ios-press mt-6 text-[14px] font-medium text-muted"
        >
          Batal
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 sm:pt-12">
      <h1 className="ios-large-title mb-6 text-foreground">Menu</h1>

      <Section>
        <MenuRow
          icon={<User className="h-[18px] w-[18px]" />}
          label="Role"
          value={isOwner ? "Owner" : "Pegawai"}
        />
      </Section>

      {isOwner && (
        <Section title="Pengaturan">
          <MenuRow
            icon={<KeyRound className="h-[18px] w-[18px]" />}
            label="Ganti PIN"
            onClick={startChangePin}
          />
          <MenuRow
            icon={<RefreshCw className="h-[18px] w-[18px]" />}
            label="Sinkronisasi Data"
            value="Segera hadir"
            disabled
          />
        </Section>
      )}
<Section title="Tampilan">
        <button
          type="button"
          role="switch"
          aria-checked={dark}
          onClick={toggleTheme}
          className="ios-press flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex h-7 w-7 items-center justify-center text-muted">
            {dark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </span>
          <span className="flex-1 text-[15px] text-foreground">Tema Gelap</span>
          <Switch checked={dark} />
        </button>
      </Section>

      <Section title="Bantuan">
        <MenuRow
          icon={<BookOpen className="h-[18px] w-[18px]" />}
          label="Panduan Penggunaan"
          onClick={() => router.push("/menu/panduan")}
        />
        <MenuRow
          icon={<HelpCircle className="h-[18px] w-[18px]" />}
          label="FAQ"
          onClick={() => router.push("/menu/faq")}
        />
        <MenuRow
          icon={<MessageCircleWarning className="h-[18px] w-[18px]" />}
          label="Laporkan Masalah"
          onClick={() => window.open(LAPORKAN_MASALAH_URL, "_blank")}
        />
        <MenuRow
          icon={<Info className="h-[18px] w-[18px]" />}
          label="Tentang Aplikasi"
          onClick={() => router.push("/menu/tentang")}
        />
      </Section>

      <div className="mt-4 flex flex-col items-center gap-0.5 pb-4 text-center">
        <p className="text-[13px] font-semibold text-foreground">Nike Aquarium</p>
        <p className="text-[12px] text-muted">v1.0.0</p>
        <p className="mt-3 text-[12px] text-muted">Designed &amp; Developed by</p>
        <p className="text-[12px] font-semibold text-foreground">Ryo Satriagung Hidayat</p>
      </div>
    </main>
  );
}