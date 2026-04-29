"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { leadsApi, carsApi } from "@/lib/api";
import { toArray, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Car,
  Calendar,
  Globe,
  ExternalLink,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const LEAD_STATUSES = ["New", "Contacted", "Visited Store", "Sold", "Lost"];

const statusTimelineIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  New: Clock,
  Contacted: Phone,
  "Visited Store": Car,
  Sold: CheckCircle,
  Lost: XCircle,
};

export function EditLeadClient({ leadId }: { leadId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lead, setLead] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [relatedCars, setRelatedCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await leadsApi.getOne(leadId);
        const data = res.data?.data || res.data?.lead || res.data;
        setLead(data);

        // Try to find related cars by interested model
        if (data?.interestedModel) {
          try {
            const carsRes = await carsApi.getAll();
            const allCars = toArray(carsRes);
            const matching = allCars.filter((c: Record<string, unknown>) => {
              const modelName =
                typeof c.model === "object"
                  ? (c.model as { name?: string })?.name
                  : c.model;
              return modelName
                ?.toString()
                .toLowerCase()
                .includes(data.interestedModel.toLowerCase());
            });
            setRelatedCars(matching.slice(0, 5));
          } catch {
            /* ignore */
          }
        }
      } catch {
        toast.error("Failed to load lead");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [leadId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await leadsApi.updateStatus(leadId, newStatus);
      setLead((prev: Record<string, unknown>) => ({
        ...prev,
        status: newStatus,
      }));
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await leadsApi.delete(leadId);
      toast.success("Lead deleted");
      window.location.href = "/leads";
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading lead..." />;
  if (!lead) {
    return (
      <div className="text-center py-20">
        <User className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Lead not found</p>
      </div>
    );
  }

  const currentStatusIndex = LEAD_STATUSES.indexOf(lead.status);

  return (
    <div className="space-y-6">
      <Breadcrumbs entityName={lead.name} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{lead.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={lead.status} size="md" />
                      {lead.source && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {lead.source}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-200">{lead.email}</p>
                    </div>
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                    <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs text-emerald-500">
                        WhatsApp / Phone
                      </p>
                      <p className="text-sm text-emerald-300">{lead.phone}</p>
                    </div>
                  </a>
                )}
                {lead.interestedModel && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                    <Car className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Interested In</p>
                      <p className="text-sm text-slate-200">
                        {lead.interestedModel}
                      </p>
                    </div>
                  </div>
                )}
                {lead.createdAt && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Created</p>
                      <p className="text-sm text-slate-200">
                        {formatDate(lead.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {lead.message && (
                <div className="mt-4 p-4 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-xs text-slate-500">Message</p>
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-line">
                    {lead.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>
                Lead progression through the sales pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {LEAD_STATUSES.map((status, i) => {
                  const Icon = statusTimelineIcons[status] || Clock;
                  const isActive = status === lead.status;
                  const isPast =
                    currentStatusIndex >= 0 && i <= currentStatusIndex;
                  const isLost = lead.status === "Lost" && status === "Lost";

                  return (
                    <div key={status} className="flex items-center">
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all shrink-0 ${
                          isActive
                            ? isLost
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            : isPast
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                              : "bg-slate-800/50 border-slate-700/30 text-slate-600"
                        }`}>
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium whitespace-nowrap">
                          {status}
                        </span>
                      </div>
                      {i < LEAD_STATUSES.length - 1 && (
                        <div
                          className={`w-6 h-0.5 mx-1 ${
                            isPast && i < currentStatusIndex
                              ? "bg-emerald-500/30"
                              : "bg-slate-700/30"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Related Cars */}
          {relatedCars.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-4 w-4" /> Related Cars
                </CardTitle>
                <CardDescription>
                  Cars matching &quot;{lead.interestedModel}&quot;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {relatedCars.map((car: Record<string, unknown>) => {
                    const brand =
                      typeof car.brand === "object"
                        ? (car.brand as { name?: string })?.name
                        : car.brand;
                    const model =
                      typeof car.model === "object"
                        ? (car.model as { name?: string })?.name
                        : car.model;
                    return (
                      <Link
                        key={car._id as string}
                        href={`/cars/${car._id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group">
                        <div>
                          <p className="text-sm font-medium text-slate-200 group-hover:text-white">
                            {String(brand)} {String(model)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {String(car.year)} · {String(car.color)} ·{" "}
                            {String(car.vin)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={String(car.status)} />
                          <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Update Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={lead.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Quick Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-emerald-400"
                    size="sm">
                    <Phone className="h-3.5 w-3.5 mr-2" /> WhatsApp
                  </Button>
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm">
                    <Mail className="h-3.5 w-3.5 mr-2" /> Send Email
                  </Button>
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm">
                    <Phone className="h-3.5 w-3.5 mr-2" /> Call
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Lead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete the lead for ${lead.name}?`}
      />
    </div>
  );
}
