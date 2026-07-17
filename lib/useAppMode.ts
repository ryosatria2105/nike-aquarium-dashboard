"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { AppMode } from "./nav";

/**
 * Hook untuk mengetahui mode aplikasi aktif (owner/pegawai).
 *
 * CATATAN PENTING soal `pathname` di dependency array:
 * Komponen `TabBar` yang memakai hook ini dirender sekali di root
 * `app/layout.tsx` dan TIDAK unmount saat user pindah halaman lewat
 * client-side navigation (Link/router.push). Kalau efek ini cuma
 * dijalankan sekali (dependency kosong `[]`), maka begitu mode
 * ter-resolve pertama kali (misal sebagai "owner" dari fallback
 * /api/session-status saat localStorage belum ke-set), nilai itu akan
 * NYANGKUT selamanya — walau user sudah pindah ke Mode Pegawai dan
 * localStorage sudah ke-update, navbar tidak akan pernah tahu.
 *
 * Karena itu, `pathname` sengaja dijadikan dependency: setiap kali user
 * berpindah halaman, hook ini re-check ulang localStorage supaya navbar
 * selalu sinkron dengan mode yang sebenarnya sedang aktif.
 */
export function useAppMode(): AppMode {
  const pathname = usePathname();
  const [mode, setMode] = useState<AppMode>("pegawai");

  useEffect(() => {
    let cancelled = false;

    const saved = window.localStorage.getItem("omzet:mode");
    if (saved === "owner" || saved === "pegawai") {
      setMode(saved);
      return;
    }

    fetch("/api/session-status")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setMode(data.authenticated ? "owner" : "pegawai");
      })
      .catch(() => {
        if (!cancelled) setMode("pegawai");
      });

    return () => {
      cancelled = true;
    };
    // Sengaja re-run tiap pathname berubah — lihat catatan di atas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return mode;
}