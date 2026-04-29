import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant:
      | "default"
      | "success"
      | "warning"
      | "destructive"
      | "info"
      | "secondary"
      | "outline";
  }
> = {
  New: { label: "New", variant: "info" },
  Contacted: { label: "Contacted", variant: "default" },
  "Visited Store": { label: "Visited Store", variant: "warning" },
  Sold: { label: "Sold", variant: "success" },
  Lost: { label: "Lost", variant: "destructive" },
};

interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    variant: "secondary" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
