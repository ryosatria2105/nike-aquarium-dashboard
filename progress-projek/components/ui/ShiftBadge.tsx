import { Sunrise, Sun } from "lucide-react";

export function ShiftBadge({
  shift,
  iconOnly = false,
}: {
  shift: "pagi" | "siang";
  iconOnly?: boolean;
}) {
  const isPagi = shift === "pagi";
  const Icon = isPagi ? Sunrise : Sun;

  if (iconOnly) {
    return (
      <Icon
        className="h-[18px] w-[18px]"
        strokeWidth={2.25}
        style={{ color: isPagi ? "var(--success)" : "var(--warning)" }}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${
        isPagi ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
      }`}
    >
      <Icon className="h-3 w-3" strokeWidth={2.25} />
      {isPagi ? "Pagi" : "Siang"}
    </span>
  );
}