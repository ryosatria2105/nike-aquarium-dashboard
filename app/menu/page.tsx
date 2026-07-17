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
  ArrowLeft,
  Lock,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { PinPad } from "@/components/ui/PinPad";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { getBackHref } from "@/lib/nav";

const LAPORKAN_MASALAH_URL =
  "https://wa.me/6287870165060?text=" +
  encodeURIComponent("Halo, saya ingin melaporkan masalah pada aplikasi Nike Aquarium: ");

type PinStep = "old" | "new" | "confirm";
type PinStage = "form" | "loading" | "success";

type PinStepInfo = {
  order: number;
  title: string;
  subtitle: string;
  icon: typeof Lock;
  color: string;
};

const PIN_STEP_META: Record<PinStep, PinStepInfo> = {
  old: {
    order: 1,
    title: "Masukkan PIN Lama",
    subtitle: "Verifikasi identitas kamu sebagai Owner terlebih dahulu.",
    icon: Lock,
    color: "#0A84FF",
  },
  new: {
    order: 2,
    title: "Buat PIN Baru",
    subtitle: "Gunakan 4 digit yang mudah kamu ingat, tapi tetap aman.",
    icon: KeyRound,
    color: "#FF9500",
  },
  confirm: {
    order: 3,
    title: "Konfirmasi PIN Baru",
    subtitle: "Ketik ulang PIN yang sama persis untuk konfirmasi.",
    icon: ShieldCheck,
    color: "#34C759",
  },
};

const TOTAL_PIN_STEPS = 3;

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

/** Progress bar 3 segmen di atas flow Ganti PIN — nunjukin lagi di step mana. */
function PinStepProgress({ currentOrder }: { currentOrder: number }) {
  return (
    <div className="mb-8 flex w-full max-w-[200px] gap-1.5">
      {Array.from({ length: TOTAL_PIN_STEPS }).map((_, i) => {
        const stepOrder = i + 1;
        const filled = stepOrder <= currentOrder;
        return (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              filled ? "bg-primary" : "bg-border"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function MenuPage() {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<"pegawai" | "owner">("pegawai");
  const [dark, setDark] = useState(false);

  const [changingPin, setChangingPin] = useState(false);
  const [pinStep, setPinStep] = useState<PinStep>("old");
  const [pinStage, setPinStage] = useState<PinStage>("form");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

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
    setPinStage("form");
    setPinInput("");
    setOldPin("");
    setNewPin("");
    setPinError(null);
  }

  function triggerShake(message: string) {
    setPinError(message);
    setShakeKey((k) => k + 1);
  }

  /** Tombol back di AppBar flow Ganti PIN: mundur 1 step, atau tutup flow kalau sudah di step pertama. */
  function handlePinFlowBack() {
    if (pinStage !== "form") return; // jangan bisa kabur pas lagi submit/sukses
    if (pinStep === "old") {
      setChangingPin(false);
      return;
    }
    if (pinStep === "new") {
      setPinStep("old");
      setPinInput("");
      setOldPin("");
      setPinError(null);
      return;
    }
    setPinStep("new");
    setPinInput("");
    setNewPin("");
    setPinError(null);
  }

  async function handlePinInputChange(v: string) {
    if (pinStage !== "form") return;
    setPinInput(v);
    setPinError(null);
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
        triggerShake("PIN baru tidak cocok. Coba lagi dari awal.");
        setPinStep("new");
        setPinInput("");
        setNewPin("");
        return;
      }

      setPinStage("loading");
      try {
        const res = await fetch("/api/change-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinLama: oldPin, pinBaru: v }),
        });
        const data = await res.json();
        if (!res.ok) {
          setPinStage("form");
          triggerShake(data.error ?? "PIN lama salah. Coba lagi.");
          setPinStep("old");
          setPinInput("");
          setOldPin("");
          return;
        }

        setPinStage("success");
        setTimeout(() => {
          toast.success("PIN berhasil diganti.");
          setChangingPin(false);
          setPinStage("form");
        }, 1100);
      } catch {
        setPinStage("form");
        triggerShake("Terjadi kesalahan jaringan. Coba lagi.");
      }
    }
  }

  if (changingPin) {
    const meta = PIN_STEP_META[pinStep];
    const StepIcon = meta.icon;

    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-8 pb-6 sm:pt-12">
        <div className="mb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handlePinFlowBack}
            disabled={pinStage !== "form"}
            aria-label="Kembali"
            className="ios-press flex h-9 w-9 shrink-0 items-center justify-center text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[17px] font-semibold text-foreground">Ganti PIN</h1>
        </div>

        <div className="flex flex-1 flex-col items-center pt-8">
          {pinStage === "success" ? (
            <div className="flex flex-col items-center pt-10 text-center animate-scale-in">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/12 text-success">
                <CheckCircle2 className="h-10 w-10" strokeWidth={2} />
              </div>
              <h2 className="text-[19px] font-semibold text-foreground">PIN Berhasil Diganti</h2>
              <p className="mt-1 text-[14px] text-muted">Kembali ke Menu…</p>
            </div>
          ) : (
            <div key={pinStep} className="flex w-full flex-col items-center animate-fade-slide-in">
              <PinStepProgress currentOrder={meta.order} />

              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: `${meta.color}1F`, color: meta.color }}
              >
                <StepIcon className="h-7 w-7" strokeWidth={2} />
              </div>

              <h2 className="text-[20px] font-semibold text-foreground">{meta.title}</h2>
              <p className="mt-1 mb-10 max-w-[280px] text-center text-[14px] leading-snug text-muted">
                {meta.subtitle}
              </p>

              <div key={shakeKey} className={pinError ? "animate-shake" : ""}>
                <PinPad
                  value={pinInput}
                  onChange={handlePinInputChange}
                  error={!!pinError}
                  disabled={pinStage === "loading"}
                />
              </div>

              <div className="mt-8 flex h-5 items-center gap-1.5">
                {pinStage === "loading" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />
                    <p className="text-[13px] text-muted">Menyimpan perubahan…</p>
                  </>
                ) : (
                  <p className="text-[13px] text-danger">{pinError}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 sm:pt-12">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(getBackHref(mode, "menu"))}
          aria-label="Kembali"
          className="ios-press flex h-9 w-9 shrink-0 items-center justify-center text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="ios-large-title text-foreground">Menu</h1>
      </div>

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