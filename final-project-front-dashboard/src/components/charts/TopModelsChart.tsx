"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFormatter = (...args: any[]) => any;

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TopModelsChartProps {
  data: { model: string; count: number }[];
}

const COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

export function TopModelsChart({ data }: TopModelsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="model"
          width={100}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            color: "#f1f5f9",
          }}
          formatter={((v: number) => [v, "Cars"]) as AnyFormatter}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
