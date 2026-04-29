"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface InventoryData {
  status: string;
  count: number;
  value?: number;
}

const STATUS_COLORS: Record<string, string> = {
  "In Stock": "#10b981",
  "In Transit": "#a855f7",
  Reserved: "#f59e0b",
  Sold: "#3b82f6",
};

const DEFAULT_COLOR = "#64748b";

interface InventoryAnalysisProps {
  data: InventoryData[];
  totalValue?: number;
}

export function InventoryAnalysis({
  data,
  totalValue,
}: InventoryAnalysisProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-12">
        No inventory data available
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={({ name, percent }: any) =>
                `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: "#475569", strokeWidth: 1 }}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={STATUS_COLORS[entry.status] || DEFAULT_COLOR}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#e2e8f0",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value} cars`, "Count"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="rounded-lg border border-slate-800 divide-y divide-slate-800">
        {data.map((item) => (
          <div
            key={item.status}
            className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: STATUS_COLORS[item.status] || DEFAULT_COLOR,
                }}
              />
              <span className="text-sm text-slate-300">{item.status}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-200">
                {item.count}
              </span>
              <span className="text-xs text-slate-500 w-12 text-right">
                {total > 0
                  ? `${((item.count / total) * 100).toFixed(0)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalValue !== undefined && totalValue > 0 && (
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">Total Inventory Value</p>
          <p className="text-lg font-bold text-white">
            {formatCurrency(totalValue)}
          </p>
        </div>
      )}
    </div>
  );
}
