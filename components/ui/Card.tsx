import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-10px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}