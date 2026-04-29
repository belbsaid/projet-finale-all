"use client";

import { TrendingUp, Users, Target, Clock } from "lucide-react";

interface LeadConversionProps {
  totalLeads: number;
  convertedLeads: number;
  lostLeads: number;
  avgConversionDays?: number;
}

export function LeadConversion({
  totalLeads,
  convertedLeads,
  lostLeads,
  avgConversionDays,
}: LeadConversionProps) {
  const conversionRate =
    totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";
  const activeLeads = totalLeads - convertedLeads - lostLeads;

  return (
    <div className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={Target}
          color="text-emerald-400 bg-emerald-500/10"
        />
        <MetricCard
          label="Total Leads"
          value={String(totalLeads)}
          icon={Users}
          color="text-indigo-400 bg-indigo-500/10"
        />
        <MetricCard
          label="Converted"
          value={String(convertedLeads)}
          icon={TrendingUp}
          color="text-blue-400 bg-blue-500/10"
        />
        <MetricCard
          label="Avg. Days"
          value={avgConversionDays ? `${avgConversionDays}d` : "—"}
          icon={Clock}
          color="text-amber-400 bg-amber-500/10"
        />
      </div>

      {/* Funnel */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 font-medium">Pipeline Funnel</p>
        <FunnelBar
          label="Total Leads"
          value={totalLeads}
          max={totalLeads}
          color="bg-slate-600"
        />
        <FunnelBar
          label="Active"
          value={activeLeads}
          max={totalLeads}
          color="bg-indigo-500"
        />
        <FunnelBar
          label="Converted (Sold)"
          value={convertedLeads}
          max={totalLeads}
          color="bg-emerald-500"
        />
        <FunnelBar
          label="Lost"
          value={lostLeads}
          max={totalLeads}
          color="bg-red-500"
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function FunnelBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{value}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}
