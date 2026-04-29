"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { TopModelsChart } from "@/components/charts/TopModelsChart";
import { InventoryAnalysis } from "@/components/reports/InventoryAnalysis";
import { LeadConversion } from "@/components/reports/LeadConversion";
import { ExportButton } from "@/components/reports/ExportButton";
import { reportsApi, carsApi, leadsApi } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency, toArray } from "@/lib/utils";
import { TrendingUp, Car, DollarSign, Users } from "lucide-react";

interface RevenuePoint {
  month: string;
  revenue: number;
}
interface ModelPoint {
  model: string;
  count: number;
}
interface InventoryItem {
  status: string;
  count: number;
}

export default function ReportsPage() {
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [models, setModels] = useState<ModelPoint[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [leadStats, setLeadStats] = useState({
    total: 0,
    converted: 0,
    lost: 0,
  });
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("12");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
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
        const count = Number(period);
        const now = new Date();

        // Revenue data
        const revenuePromises = Array.from({ length: count }, (_, i) => {
          const d = new Date(
            now.getFullYear(),
            now.getMonth() - (count - 1 - i),
            1,
          );
          return reportsApi
            .getRevenue({
              month: String(d.getMonth() + 1),
              year: String(d.getFullYear()),
            })
            .then((r) => ({
              month: months[d.getMonth()],
              revenue: r.data?.data?.totalRevenue ?? 0,
            }))
            .catch(() => ({
              month: months[d.getMonth()],
              revenue: 0,
            }));
        });

        const [revData, modRes] = await Promise.all([
          Promise.all(revenuePromises),
          reportsApi.getTopModels({ limit: 10 }),
        ]);
        setRevenue(revData);
        const modData = modRes.data?.data || modRes.data || [];
        setModels(Array.isArray(modData) ? modData : []);

        // Inventory analysis
        try {
          const carsRes = await carsApi.getAll();
          const allCars = toArray(carsRes);
          const statusCounts: Record<string, number> = {};
          let totalVal = 0;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allCars.forEach((car: any) => {
            const st = car.status || "Unknown";
            statusCounts[st] = (statusCounts[st] || 0) + 1;
            totalVal += car.costPriceDZD || car.sellingPriceDZD || 0;
          });
          setInventory(
            Object.entries(statusCounts).map(([status, count]) => ({
              status,
              count,
            })),
          );
          setTotalInventoryValue(totalVal);
        } catch {
          /* ignore */
        }

        // Lead stats
        try {
          const leadsRes = await leadsApi.getAll();
          const allLeads = toArray(leadsRes);
          const converted = allLeads.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (l: any) => l.status === "Sold",
          ).length;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lost = allLeads.filter((l: any) => l.status === "Lost").length;
          setLeadStats({
            total: allLeads.length,
            converted,
            lost,
          });
        } catch {
          /* ignore */
        }
      } catch {
        toast.error("Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [period]);

  const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0);
  const avgMonthly = revenue.length > 0 ? totalRevenue / revenue.length : 0;
  const peakMonth = revenue.reduce(
    (a, b) => (b.revenue > a.revenue ? b : a),
    revenue[0] || { month: "—", revenue: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Business analytics and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={revenue.map((r) => ({
              Month: r.month,
              Revenue: r.revenue,
            }))}
            filename="revenue-report"
            label="Export Revenue"
          />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
              <SelectItem value="24">Last 24 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
            color: "bg-emerald-500/10 text-emerald-400",
          },
          {
            title: "Avg Monthly",
            value: formatCurrency(avgMonthly),
            icon: TrendingUp,
            color: "bg-indigo-500/10 text-indigo-400",
          },
          {
            title: "Peak Month",
            value: peakMonth?.month || "—",
            icon: Car,
            color: "bg-amber-500/10 text-amber-400",
          },
          {
            title: "Top Model",
            value: models[0]?.model || "—",
            icon: Users,
            color: "bg-purple-500/10 text-purple-400",
          },
        ].map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{title}</p>
                  <p className="text-xl font-bold mt-1 truncate">
                    {isLoading ? <Skeleton className="h-6 w-24" /> : value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue & Top Models Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Monthly revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72" />
            ) : (
              <RevenueChart data={revenue} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Models by Sales</CardTitle>
            <CardDescription>
              Best performing car models — click to view
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72" />
            ) : models.length > 0 ? (
              <TopModelsChart data={models} />
            ) : (
              <p className="text-center text-muted-foreground py-20">
                No data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Analysis & Lead Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Analysis</CardTitle>
                <CardDescription>Cars by status breakdown</CardDescription>
              </div>
              <ExportButton
                data={inventory.map((i) => ({
                  Status: i.status,
                  Count: i.count,
                }))}
                filename="inventory-report"
                label="Export"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72" />
            ) : (
              <InventoryAnalysis
                data={inventory}
                totalValue={totalInventoryValue}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lead Conversion</CardTitle>
                <CardDescription>Sales pipeline performance</CardDescription>
              </div>
              <ExportButton
                data={[
                  {
                    Metric: "Total Leads",
                    Value: leadStats.total,
                  },
                  {
                    Metric: "Converted",
                    Value: leadStats.converted,
                  },
                  {
                    Metric: "Lost",
                    Value: leadStats.lost,
                  },
                  {
                    Metric: "Conversion Rate",
                    Value:
                      leadStats.total > 0
                        ? `${((leadStats.converted / leadStats.total) * 100).toFixed(1)}%`
                        : "0%",
                  },
                ]}
                filename="lead-conversion-report"
                label="Export"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72" />
            ) : (
              <LeadConversion
                totalLeads={leadStats.total}
                convertedLeads={leadStats.converted}
                lostLeads={leadStats.lost}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
