import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  message = "No data to display",
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}>
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 mb-4">
        <Icon className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
