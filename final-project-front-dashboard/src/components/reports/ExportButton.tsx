"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
}

export function ExportButton({
  data,
  filename,
  label = "Export CSV",
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            const str = val === null || val === undefined ? "" : String(val);
            // Escape quotes and wrap in quotes if contains comma
            return str.includes(",") || str.includes('"')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(","),
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!data || data.length === 0}>
      <Download className="h-3.5 w-3.5 mr-1.5" />
      {label}
    </Button>
  );
}
