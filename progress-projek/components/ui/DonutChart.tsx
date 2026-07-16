"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  centerSubLabel,
}: {
  data: DonutSlice[];
  centerLabel: string;
  centerValue: string;
  centerSubLabel: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = total > 0 ? data : [{ key: "empty", label: "", value: 1, color: "var(--border)" }];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            paddingAngle={total > 0 ? 3 : 0}
            isAnimationActive={false}
          >
            {chartData.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <p className="text-[12px] text-muted">{centerLabel}</p>
        <p className="font-tabular mt-1 text-[19px] font-bold leading-tight text-foreground">
          {centerValue}
        </p>
        <p className="mt-0.5 text-[12px] text-muted">{centerSubLabel}</p>
      </div>
    </div>
  );
}