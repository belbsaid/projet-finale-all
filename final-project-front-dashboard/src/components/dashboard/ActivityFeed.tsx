"use client";

import { useEffect, useState } from "react";
import { activitiesApi } from "@/lib/api";
import {
  Car,
  Truck,
  Users,
  Tag,
  Layers,
  Award,
  ArrowRightLeft,
  Sparkles,
  Phone,
  Store,
  ShoppingCart,
  XCircle,
  CheckCircle,
  Package,
  DollarSign,
  Trash2,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

/* ── Icon / color mapping from activity type ──────────────────────────── */

function activityMeta(type: string) {
  switch (type) {
    case "car_created":
      return { icon: Car, color: "text-indigo-400 bg-indigo-500/10" };
    case "car_status_changed":
      return { icon: ArrowRightLeft, color: "text-purple-400 bg-purple-500/10" };
    case "car_deleted":
      return { icon: Trash2, color: "text-red-400 bg-red-500/10" };
    case "lead_created":
      return { icon: Sparkles, color: "text-blue-400 bg-blue-500/10" };
    case "lead_status_changed":
      return { icon: ArrowRightLeft, color: "text-amber-400 bg-amber-500/10" };
    case "lead_deleted":
      return { icon: XCircle, color: "text-red-400 bg-red-500/10" };
    case "meeting_booked":
      return { icon: CalendarCheck, color: "text-emerald-400 bg-emerald-500/10" };
    case "brand_created":
      return { icon: Award, color: "text-pink-400 bg-pink-500/10" };
    case "brand_deleted":
      return { icon: Trash2, color: "text-pink-400 bg-pink-500/10" };
    case "model_created":
      return { icon: Layers, color: "text-cyan-400 bg-cyan-500/10" };
    case "model_deleted":
      return { icon: Trash2, color: "text-cyan-400 bg-cyan-500/10" };
    case "category_created":
      return { icon: Tag, color: "text-teal-400 bg-teal-500/10" };
    case "category_deleted":
      return { icon: Trash2, color: "text-teal-400 bg-teal-500/10" };
    default:
      return { icon: Users, color: "text-slate-400 bg-slate-500/10" };
  }
}

/* ── Entity-type to href prefix mapping ───────────────────────────────── */

function activityHref(type: string, entityType?: string, entityId?: string) {
  if (!entityId) return "#";
  switch (entityType) {
    case "car":
      return `/cars/${entityId}`;
    case "lead":
      // Deleted leads don't exist anymore, but the link won't crash
      return type.includes("deleted") ? "#" : `/leads/${entityId}`;
    case "brand":
      return `/brands`;
    case "model":
      return `/models`;
    case "category":
      return `/categories`;
    default:
      return "#";
  }
}

/* ── Relative time helper ─────────────────────────────────────────────── */

function timeAgo(date: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

/* ── Component ────────────────────────────────────────────────────────── */

export function ActivityFeed({ limit = 50, compact = false }: { limit?: number; compact?: boolean } = {}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await activitiesApi.getAll({ limit });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any[] = res.data?.activities ?? [];

        const mapped: Activity[] = raw.map((a) => {
          const meta = activityMeta(a.type);
          return {
            id: a._id,
            type: a.type,
            title: a.title,
            description: a.description || "",
            date: a.createdAt,
            href: activityHref(a.type, a.entityType, a.entityId),
            icon: meta.icon,
            color: meta.color,
          };
        });

        setActivities(mapped);
      } catch {
        // Silently fall back to empty
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-8">
        No recent activity
      </p>
    );
  }

  return (
    <div className={`space-y-0.5 overflow-y-auto pr-1 ${compact ? "max-h-[480px]" : "h-[calc(100vh-12rem)]"}`}>
      {activities.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.id}
            href={act.href}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${act.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                {act.title}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {act.description}
              </p>
            </div>
            <span className="text-xs text-slate-600 shrink-0 mt-0.5 whitespace-nowrap">
              {timeAgo(act.date)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
