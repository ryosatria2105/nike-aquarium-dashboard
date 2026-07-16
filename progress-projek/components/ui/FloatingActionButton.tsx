import Link from "next/link";
import { Plus } from "lucide-react";

export function FloatingActionButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Input laporan baru"
      className="ios-press flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_-4px_rgba(16,185,129,0.55)]"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </Link>
  );
}