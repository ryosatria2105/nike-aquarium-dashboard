"use client";

import { usePathname } from "next/navigation";
import { useAppMode } from "@/lib/useAppMode";
import { OwnerTabBar } from "./OwnerTabBar";
import { EmployeeTabBar } from "./EmployeeTabBar";

export function TabBar() {
  const pathname = usePathname();
  const mode = useAppMode();

  if (pathname === "/" || pathname === "/masuk") return null;

  return mode === "owner" ? (
    <OwnerTabBar pathname={pathname} />
  ) : (
    <EmployeeTabBar pathname={pathname} />
  );
}