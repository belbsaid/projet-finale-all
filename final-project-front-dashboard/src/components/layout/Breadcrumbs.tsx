"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeNames: Record<string, string> = {
  cars: "Cars",
  brands: "Brands",
  models: "Models",
  categories: "Categories",
  leads: "Leads",
  documents: "Documents",
  reports: "Reports",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

interface BreadcrumbsProps {
  /** Override the last segment label (e.g. car name, brand name) */
  entityName?: string;
}

export function Breadcrumbs({ entityName }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    // If it's the last segment and we have an entityName override, use it
    // If it looks like a mongo ID, use entityName or "Detail"
    let label = routeNames[seg] || seg;
    if (isLast && entityName) {
      label = entityName;
    } else if (/^[a-f0-9]{24}$/i.test(seg)) {
      label = entityName || "Detail";
    }

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-400 mb-4">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-white transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>
      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-slate-600" />
          {isLast ? (
            <span className="text-white font-medium truncate max-w-[200px]">
              {label}
            </span>
          ) : (
            <Link
              href={href}
              className="hover:text-white transition-colors capitalize">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
