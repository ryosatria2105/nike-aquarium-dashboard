import { ReactNode } from "react";

type Tone = "primary" | "accent" | "success";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: boolean;
  tone?: Tone;
  sub?: string;
  subColor?: "success" | "warning" | "danger" | "muted" | "foreground";
}

const SUB_COLOR_CLASS: Record<NonNullable<StatCardProps["subColor"]>, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  muted: "text-muted",
  foreground: "text-foreground",
};

const ICON_TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  accent: "bg-accent/12 text-accent",
  success: "bg-success/12 text-success",
};

export function StatCard({
  label,
  value,
  icon,
  accent = false,
  tone,
  sub,
  subColor = "muted",
}: StatCardProps) {
  const resolvedTone: Tone = tone ?? (accent ? "accent" : "primary");

  return (
    <div className="flex h-full items-start gap-3 rounded-2xl bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
      {icon && (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_TONE_CLASS[resolvedTone]}`}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-snug text-muted">{label}</p>
        <p className="font-tabular mt-1 text-[16px] font-bold leading-tight tracking-tight text-foreground">
          {value}
        </p>
        {sub && (
          <p className={`mt-1 text-[11px] font-medium leading-snug ${SUB_COLOR_CLASS[subColor]}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}