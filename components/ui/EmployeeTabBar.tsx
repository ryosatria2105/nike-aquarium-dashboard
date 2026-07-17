import { History, Menu as MenuIcon } from "lucide-react";
import { NavTabItem } from "./NavTabItem";
import { FloatingActionButton } from "./FloatingActionButton";

export function EmployeeTabBar({ pathname }: { pathname: string }) {
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 ios-tabbar-blur border-t border-border safe-bottom"
      style={{ height: "var(--tab-bar-height)" }}
      aria-label="Navigasi Mode Pegawai"
    >
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-2">
        <NavTabItem href="/riwayat" label="Riwayat" icon={History} active={isActive("/riwayat")} />
        <div className="relative -mt-8 flex flex-1 items-center justify-center">
          <FloatingActionButton href="/input" />
        </div>
        <NavTabItem href="/menu" label="Menu" icon={MenuIcon} active={isActive("/menu")} />
      </div>
    </nav>
  );
}