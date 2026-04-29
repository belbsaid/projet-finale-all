"use client";

import { useState } from "react";
import { toast } from "sonner";
import { carsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const CAR_STATUSES = [
  {
    value: "In Stock",
    label: "In Stock",
    color: "text-emerald-400 bg-emerald-500/10",
  },
  {
    value: "Reserved",
    label: "Reserved",
    color: "text-amber-400 bg-amber-500/10",
  },
  { value: "Sold", label: "Sold", color: "text-blue-400 bg-blue-500/10" },
  {
    value: "In Transit",
    label: "In Transit",
    color: "text-purple-400 bg-purple-500/10",
  },
  {
    value: "Maintenance",
    label: "Maintenance",
    color: "text-orange-400 bg-orange-500/10",
  },
  {
    value: "Damaged",
    label: "Damaged",
    color: "text-red-400 bg-red-500/10",
  },
];

interface StatusCellProps {
  carId: string;
  status: string;
  onStatusChange?: (newStatus: string) => void;
}

export function StatusCell({ carId, status, onStatusChange }: StatusCellProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isLoading, setIsLoading] = useState(false);

  const statusInfo =
    CAR_STATUSES.find((s) => s.value === currentStatus) || CAR_STATUSES[0];

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsLoading(true);
    try {
      await carsApi.updateStatus(carId, newStatus);
      setCurrentStatus(newStatus);
      onStatusChange?.(newStatus);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isLoading}
      className={cn(
        "text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60",
        statusInfo.color,
      )}>
      {CAR_STATUSES.map((s) => (
        <option
          key={s.value}
          value={s.value}
          className="bg-slate-900 text-white">
          {s.label}
        </option>
      ))}
    </select>
  );
}

export { CAR_STATUSES };
