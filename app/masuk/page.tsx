"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { PinPad } from "@/components/ui/PinPad";

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isSet, setIsSet] = useState<boolean | null>(null);

  const [setupStep, setSetupStep] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/pin-status")
      .then((res) => res.json())
      .then((data) => setIsSet(data.isSet))
      .catch(() => setError("Gagal memuat status. Coba refresh halaman."))
      .finally(() => setCheckingStatus(false));
  }, []);

  const isFirstSetup = isSet === false;

  const submitVerify = useCallback(
    async (pinValue: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/verify-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: pinValue }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "PIN salah.");
          setPin("");
          setLoading(false);
          return;
        }

        window.localStorage.setItem("omzet:mode", "owner");
        router.replace(next);
      } catch {
        setError("Terjadi kesalahan jaringan. Coba lagi.");
        setPin("");
        setLoading(false);
      }
    },
    [next, router]
  );

  const submitSetup = useCallback(
    async (pinValue: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/setup-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: pinValue }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Gagal mengatur PIN.");
          setSetupStep("create");
          setFirstPin("");
          setPin("");
          setLoading(false);
          return;
        }
        window.localStorage.setItem("omzet:mode", "owner");
        router.replace(next);
      } catch {
        setError("Terjadi kesalahan jaringan. Coba lagi.");
        setPin("");
        setLoading(false);
      }
    },
    [next, router]
  );

  useEffect(() => {
    if (pin.length !== 4 || loading) return;

    if (!isFirstSetup) {
      submitVerify(pin);
      return;
    }

    if (setupStep === "create") {
      setFirstPin(pin);
      setPin("");
      setSetupStep("confirm");
      return;
    }

    if (pin !== firstPin) {
      setError("PIN tidak cocok. Coba lagi dari awal.");
      setSetupStep("create");
      setFirstPin("");
      setPin("");
      return;
    }

    submitSetup(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  if (checkingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Memuat...</p>
      </div>
    );
  }

  const title = isFirstSetup
    ? setupStep === "create"
      ? "Buat PIN Baru"
      : "Ulangi PIN"
    : "Masukkan PIN";

  const subtitle = isFirstSetup
    ? setupStep === "create"
      ? "Buat PIN 4 digit untuk melindungi Dashboard & Statistik."
      : "Ketik ulang PIN yang sama untuk konfirmasi."
    : "Akses dashboard owner";

  return (
    <div className="flex min-h-screen flex-col px-6 pt-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Kembali"
        className="ios-press mb-6 flex h-9 w-9 items-center justify-center text-foreground"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="flex flex-1 flex-col items-center pt-10">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          {isFirstSetup ? <ShieldCheck className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
        </div>
        <h1 className="text-[20px] font-semibold text-foreground">{title}</h1>
        <p className="mt-1 mb-10 text-center text-[14px] text-muted">{subtitle}</p>

        <PinPad value={pin} onChange={setPin} error={!!error} disabled={loading} />

        <p className="mt-8 h-5 text-center text-[13px] text-danger">
          {loading && !error ? (
            <span className="text-muted">Memverifikasi...</span>
          ) : (
            error
          )}
        </p>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={null}>
      <MasukForm />
    </Suspense>
  );
}