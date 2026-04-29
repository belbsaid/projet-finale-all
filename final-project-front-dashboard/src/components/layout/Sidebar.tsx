"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Layers,
  Tag,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  CalendarCheck,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/models", label: "Models", icon: Layers },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/reservations", label: "Reservations", icon: CalendarCheck },
  { href: "/users", label: "Users", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
  mobile?: boolean;
}

export function Sidebar({
  collapsed,
  onToggle,
  onMobileClose,
  mobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    document.cookie = "auth-token=; path=/; max-age=0";
    toast.info("Signed out successfully");
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-slate-950 border-r border-slate-800 transition-all duration-300",
        mobile ? "w-64" : collapsed ? "w-16" : "w-64",
      )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
        {(!collapsed || mobile) && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-wide">
              AutoShip DZ
            </span>
          </Link>
        )}
        {collapsed && !mobile && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 mx-auto">
            <Car className="w-4 h-4 text-white" />
          </div>
        )}
        {!mobile && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
        {mobile && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
              )}
              title={collapsed && !mobile ? item.label : undefined}>
              <Icon
                className={cn(
                  "w-4.5 h-4.5 shrink-0",
                  collapsed && !mobile && "mx-auto",
                )}
              />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-slate-800 p-3 shrink-0">
        {!collapsed || mobile ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-700 shrink-0 text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
              title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
