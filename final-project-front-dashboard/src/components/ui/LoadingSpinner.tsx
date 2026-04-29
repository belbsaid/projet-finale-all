import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  className,
  label = "Loading...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12",
        className,
      )}>
      <Loader2 className={cn("animate-spin text-indigo-400", sizes[size])} />
      {label && <p className="text-sm text-slate-400 animate-pulse">{label}</p>}
    </div>
  );
}
