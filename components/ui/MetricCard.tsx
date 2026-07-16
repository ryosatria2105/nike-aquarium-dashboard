import { ReactNode } from "react";

export function MetricCard({
  icon,
  iconColor,
  label,
  value,
  sub,
  subColor,
}: {
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${iconColor}1F`, color: iconColor }}
      >
        {icon}
      </span>
      <div>
        <p className="text-[12px] leading-snug text-muted">{label}</p>
        <p className="font-tabular mt-0.5 text-[15px] font-bold leading-tight text-foreground">
          {value}
        </p>
        {sub && (
          <p className="mt-0.5 text-[11px] font-medium" style={{ color: subColor ?? "var(--muted)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}