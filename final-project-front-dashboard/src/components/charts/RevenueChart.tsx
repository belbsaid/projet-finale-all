"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFormatter = (...args: any[]) => any;

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; revenue: number; target?: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatValue = (v: number) =>
    new Intl.NumberFormat("fr-DZ", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(v);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatValue}
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
          formatter={((v: number) => [formatValue(v), ""]) as AnyFormatter}
        />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#6366f1" }}
          activeDot={{ r: 6 }}
        />
        {data.some((d) => d.target) && (
          <Line
            type="monotone"
            dataKey="target"
            name="Target"
            stroke="#475569"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
