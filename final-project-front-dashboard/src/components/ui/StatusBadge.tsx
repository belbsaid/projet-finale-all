import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  // Car statuses
  "In Stock": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "In Transit": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Reserved: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Sold: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  // Lead statuses
  New: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Contacted: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "Visited Store": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Lost: "bg-red-500/15 text-red-400 border-red-500/30",
};

const defaultColor = "bg-slate-500/15 text-slate-400 border-slate-500/30";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  dot?: boolean;
}

export function StatusBadge({
  status,
  size = "sm",
  className,
  dot = true,
}: StatusBadgeProps) {
  const colors = statusColors[status] || defaultColor;
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        colors,
        sizeClasses[size],
        className,
      )}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      )}
      {status}
    </span>
  );
}
