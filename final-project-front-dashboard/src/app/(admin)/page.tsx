"use client";

import { useEffect, useState } from "react";
import { reportsApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { TopModelsChart } from "@/components/charts/TopModelsChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  TrendingUp,
  Car,
  DollarSign,
  CheckCircle,
  Truck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Summary {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  inTransitCars: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topModels: { model: string; count: number }[];
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) => (
  <Card className="group hover:border-slate-700 transition-all duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let stats = {
        totalCars: 0,
        availableCars: 0,
        soldCars: 0,
        inTransitCars: 0,
        totalRevenue: 0,
      };
      let monthlyRevenue: { month: string; revenue: number }[] = [];
      let topModels: { model: string; count: number }[] = [];

      try {
        const summaryRes = await reportsApi.getSummary();
        const d = summaryRes.data?.data || summaryRes.data || {};
        stats = {
          totalCars: d.totalCars ?? 0,
          availableCars: d.carsInStock ?? d.availableCars ?? 0,
          soldCars: d.carsSold ?? d.soldCars ?? 0,
          inTransitCars: d.inTransitCars ?? 0,
          totalRevenue: d.totalRevenue ?? 0,
        };
      } catch {
        console.warn("Failed to load stats");
      }

      try {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const now = new Date();
        const revenuePromises = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return reportsApi
            .getRevenue({
              month: String(d.getMonth() + 1),
              year: String(d.getFullYear()),
            })
            .then((r) => ({
              month: months[d.getMonth()],
              revenue: r.data?.data?.totalRevenue ?? 0,
            }))
            .catch(() => ({ month: months[d.getMonth()], revenue: 0 }));
        });
        monthlyRevenue = await Promise.all(revenuePromises);
      } catch {
        monthlyRevenue = Array.from({ length: 6 }, (_, i) => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
          revenue: 0,
        }));
      }

      try {
        const modelsRes = await reportsApi.getTopModels();
        topModels = modelsRes.data?.data || modelsRes.data || [];
        if (!Array.isArray(topModels)) topModels = [];
      } catch {
        console.warn("Failed to load top models");
      }

      setSummary({ ...stats, monthlyRevenue, topModels });
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Cars"
          value={summary?.totalCars ?? 0}
          icon={Car}
          color="bg-indigo-500/10 text-indigo-400"
        />
        <StatCard
          title="In Stock"
          value={summary?.availableCars ?? 0}
          subtitle="Ready to sell"
          icon={CheckCircle}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          title="Sold"
          value={summary?.soldCars ?? 0}
          subtitle="All time"
          icon={DollarSign}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          title="In Transit"
          value={summary?.inTransitCars ?? 0}
          icon={Truck}
          color="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          icon={TrendingUp}
          color="bg-green-500/10 text-green-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>
              Revenue trend over the past months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={summary?.monthlyRevenue ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Models</CardTitle>
            <CardDescription>Best selling car models</CardDescription>
          </CardHeader>
          <CardContent>
            <TopModelsChart data={summary?.topModels ?? []} />
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions and updates across the system
            </CardDescription>
          </div>
          <Link
            href="/activities"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
            View all &rarr;
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          <ActivityFeed limit={5} compact={true} />
        </CardContent>
      </Card>
    </div>
  );
}
