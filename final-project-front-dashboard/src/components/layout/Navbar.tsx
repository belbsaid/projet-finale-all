"use client";

import { Bell, Menu, Search, Moon, Sun } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState } from "react";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/cars": "Car Inventory",
  "/cars/new": "New Car",
  "/brands": "Brands",
  "/models": "Models",
  "/categories": "Categories",
  "/reservations": "Reservations",
  "/reservations/new": "New Reservation",
  "/users": "Users",
  "/documents": "Documents",
  "/reports": "Reports",
  "/settings": "Settings",
};

/** Map of path prefixes to section labels for dynamic routes */
const dynamicRouteLabels: Record<string, string> = {
  "/cars/": "Car Details",
  "/brands/": "Brand Details",
  "/models/": "Model Details",
  "/reservations/": "Reservation Details",
  "/users/": "User Details",
};

interface NavbarProps {
  onMobileMenuClick: () => void;
}

export function Navbar({ onMobileMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [dark, setDark] = useState(false);

  // Derive label: exact match first, then prefix match for dynamic routes
  let label = routeLabels[pathname];
  if (!label) {
    for (const [prefix, name] of Object.entries(dynamicRouteLabels)) {
      if (pathname.startsWith(prefix)) {
        label = name;
        break;
      }
    }
  }
  if (!label) {
    // Ultimate fallback: capitalize the first segment
    const seg = pathname.split("/").filter(Boolean)[0] || "";
    label = seg.charAt(0).toUpperCase() + seg.slice(1);
  }

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white capitalize">{label}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme">
          {dark ? (
            <Sun className="w-4.5 h-4.5" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-700 ml-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-700 text-white text-xs font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white leading-tight">
              {user?.name}
            </p>
            <p
              className={cn(
                "text-xs capitalize",
                user?.role === "admin" ? "text-indigo-400" : "text-slate-500",
              )}>
              {user?.role || "admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
