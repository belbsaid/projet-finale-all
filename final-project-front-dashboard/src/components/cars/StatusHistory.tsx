"use client";

import { formatDate } from "@/lib/utils";
import { CheckCircle, Truck, Package, ShoppingCart, Clock } from "lucide-react";

interface StatusEntry {
  status: string;
  date: string;
  changedBy?: string;
  note?: string;
}

interface StatusHistoryProps {
  history?: StatusEntry[];
  currentStatus: string;
  createdAt?: string;
}

const statusIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "In Transit": Truck,
  "In Stock": Package,
  Reserved: Clock,
  Sold: ShoppingCart,
};

const statusColors: Record<string, string> = {
  "In Transit": "text-purple-400 bg-purple-500/10 border-purple-500/30",
  "In Stock": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Reserved: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Sold: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

const defaultColor = "text-slate-400 bg-slate-500/10 border-slate-500/30";

export function StatusHistory({
  history,
  currentStatus,
  createdAt,
}: StatusHistoryProps) {
  // Build timeline entries from history or create a simple one from current state
  const entries: StatusEntry[] =
    history && history.length > 0
      ? history
      : [
          {
            status: currentStatus,
            date: createdAt || new Date().toISOString(),
          },
        ];

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-700/50" />

      <div className="space-y-6">
        {entries.map((entry, i) => {
          const Icon = statusIcons[entry.status] || CheckCircle;
          const color = statusColors[entry.status] || defaultColor;
          const isLatest = i === entries.length - 1;

          return (
            <div key={i} className="relative flex gap-4">
              {/* Dot / Icon */}
              <div
                className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full border-2 ${color} ${
                  isLatest ? "ring-2 ring-offset-2 ring-offset-slate-900" : ""
                }`}>
                <Icon className="h-3 w-3" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">
                    {entry.status}
                  </span>
                  {isLatest && (
                    <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDate(entry.date)}
                  {entry.changedBy && <> · by {entry.changedBy}</>}
                </p>
                {entry.note && (
                  <p className="text-xs text-slate-400 mt-1">{entry.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
