"use client";

import Link from "next/link";
import { Car, Users, FileText, BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Add Car",
    href: "/cars/new",
    icon: Plus,
    color: "bg-indigo-600 hover:bg-indigo-500 text-white",
    description: "Add a new vehicle to inventory",
  },
  {
    label: "View Leads",
    href: "/leads",
    icon: Users,
    color:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    description: "Manage customer enquiries",
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    color:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    description: "View uploaded documents",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    color:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    description: "Business analytics",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <div
              className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all ${action.color}`}>
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{action.label}</span>
              <span className="text-xs opacity-60 hidden sm:block">
                {action.description}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
