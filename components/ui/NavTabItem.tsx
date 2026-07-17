import Link from "next/link";
import { LucideIcon } from "lucide-react";

export function NavTabItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link href={href} className="ios-press flex flex-1 flex-col items-center justify-center gap-0.5">
      <Icon
        className="h-5 w-5"
        strokeWidth={active ? 2.25 : 1.75}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
        style={{ color: active ? "var(--primary)" : "var(--muted)" }}
      />
      <span className="text-[11px] font-medium" style={{ color: active ? "var(--primary)" : "var(--muted)" }}>
        {label}
      </span>
    </Link>
  );
}