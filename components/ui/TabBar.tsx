"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, History, PieChart, Menu as MenuIcon } from "lucide-react";
import { FloatingActionButton } from "./FloatingActionButton";

export function TabBar() {
  const pathname = usePathname();
  const [mode, setMode] = useState<"pegawai" | "owner">("pegawai");

  useEffect(() => {
    const saved = window.localStorage.getItem("omzet:mode");
    if (saved === "owner" || saved === "pegawai") {
      setMode(saved);
      return;
    }
    // Fallback kalau belum pernah pilih mode dari splash (misal buka
    // langsung lewat bookmark) — cek status sesi PIN sebagai penentu.
    fetch("/api/session-status")
      .then((res) => res.json())
      .then((data) => setMode(data.authenticated ? "owner" : "pegawai"))
      .catch(() => setMode("pegawai"));
  }, [pathname]);

  if (pathname === "/" || pathname === "/masuk") return null;

  const isOwner = mode === "owner";

  const tabs = isOwner
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
        { href: "/riwayat", label: "Riwayat", icon: History },
        { href: "/statistik", label: "Statistik", icon: PieChart },
        { href: "/menu", label: "Menu", icon: MenuIcon },
      ]
    : [
        { href: "/riwayat", label: "Riwayat", icon: History },
        { href: "/menu", label: "Menu", icon: MenuIcon },
      ];

  // FAB selalu ada persis di tengah: bagi tab jadi 2 kelompok
  // berdasarkan titik tengah, bukan daftar kiri/kanan yang di-hardcode.
  const midpoint = Math.ceil(tabs.length / 2);
  const leftTabs = tabs.slice(0, midpoint);
  const rightTabs = tabs.slice(midpoint);

  function renderTab(tab: { href: string; label: string; icon: typeof LayoutGrid }) {
    const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
    const Icon = tab.icon;
    return (
      <Link
        key={tab.href}
        href={tab.href}
        className="ios-press flex flex-1 flex-col items-center justify-center gap-0.5"
      >
        <Icon
          className="h-5 w-5"
          strokeWidth={active ? 2.25 : 1.75}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
          style={{ color: active ? "var(--primary)" : "var(--muted)" }}
        />
        <span
          className="text-[11px] font-medium"
          style={{ color: active ? "var(--primary)" : "var(--muted)" }}
        >
          {tab.label}
        </span>
      </Link>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 ios-tabbar-blur border-t border-border safe-bottom"
      style={{ height: "var(--tab-bar-height)" }}
      aria-label="Navigasi utama"
    >
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-2">
        {leftTabs.map(renderTab)}
        <div className="relative -mt-8 flex flex-1 items-center justify-center">
          <FloatingActionButton href="/input" />
        </div>
        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}