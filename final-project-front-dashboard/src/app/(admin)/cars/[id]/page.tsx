"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { carsApi, leadsApi } from "@/lib/api";
import { toArray, formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PhotoGallery } from "@/components/cars/PhotoGallery";
import { StatusHistory } from "@/components/cars/StatusHistory";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  Pencil,
  Trash2,
  Download,
  FileText,
  Users,
  Car,
  Fuel,
  Gauge,
  Settings2,
  Calendar,
  ExternalLink,
  Upload,
} from "lucide-react";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CarData = any;

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [car, setCar] = useState<CarData>(null);
  const [relatedLeads, setRelatedLeads] = useState<CarData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    try {
      const res = await carsApi.getOne(id);
      const data = res.data?.data || res.data?.car || res.data;
      setCar(data);

      // Load related leads by carId
      try {
        const leadsRes = await leadsApi.getAll({ carId: id });
        setRelatedLeads(toArray(leadsRes).slice(0, 10));
      } catch {
        /* ignore */
      }
    } catch {
      toast.error("Failed to load car details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await carsApi.updateStatus(id, newStatus);
      // Reload car data to get fresh status and history
      const res = await carsApi.getOne(id);
      const data = res.data?.data || res.data?.car || res.data;
      setCar(data);
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await carsApi.delete(id);
      toast.success("Car deleted");
      router.push("/cars");
    } catch {
      toast.error("Failed to delete car");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading car details..." />;
  if (!car) {
    return (
      <div className="text-center py-20">
        <Car className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Car not found</p>
        <Link href="/cars">
          <Button variant="outline" className="mt-4">
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const brandName =
    typeof car.brand === "object" ? car.brand?.name ?? "Unknown" : car.brand ?? "Unknown";
  const brandId = typeof car.brand === "object" ? car.brand?._id : null;
  const modelName =
    typeof car.model === "object" ? car.model?.name ?? "Unknown" : car.model ?? "Unknown";
  const modelId = typeof car.model === "object" ? car.model?._id : null;
  const categoryName =
    typeof car.category === "object" ? car.category?.name : car.category;

  const photos = car.photos || [];
  const documents = car.documents || [];
  const costPrice = car.costPriceDZD || 0;
  const sellPrice = car.sellingPriceDZD || car.finalPriceDZD || 0;
  const discount = car.discountDZD || 0;
  const finalPrice = car.finalPriceDZD || sellPrice - discount;
  const profit = finalPrice - costPrice;

  const backendBaseUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
  ).replace("/api", "");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumbs entityName={`${brandName} ${modelName}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Photo Gallery + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-white">
                      {brandName} {modelName}
                    </h1>
                    <StatusBadge status={car.status} size="md" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>{car.year}</span>
                    <span className="text-slate-700">·</span>
                    <span>{car.color}</span>
                    {car.stockNumber && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span>#{car.stockNumber}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    VIN: {car.vin}
                  </p>
                </div>
              </div>
              <PhotoGallery photos={photos} alt={`${brandName} ${modelName}`} />
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="info">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="history">Status History</TabsTrigger>
              <TabsTrigger value="documents">
                Documents {documents.length > 0 && `(${documents.length})`}
              </TabsTrigger>
              <TabsTrigger value="leads">Related Leads</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <InfoItem
                      label="Brand"
                      value={brandName}
                      href={brandId ? `/brands/${brandId}` : undefined}
                    />
                    <InfoItem
                      label="Model"
                      value={modelName}
                      href={modelId ? `/models/${modelId}` : undefined}
                    />
                    <InfoItem label="Category" value={categoryName || "—"} />
                    <InfoItem label="Year" value={String(car.year)} />
                    <InfoItem label="Color" value={car.color} />
                    <InfoItem
                      label="Mileage"
                      value={
                        car.mileage
                          ? `${car.mileage.toLocaleString()} km`
                          : "0 km"
                      }
                    />
                    <InfoItem label="VIN" value={car.vin} mono />
                  </div>
                </CardContent>
              </Card>

              {/* Customer info if sold */}
              {car.customer && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem label="Name" value={car.customer.name} />
                      <InfoItem
                        label="Phone"
                        value={car.customer.phone || "—"}
                        href={
                          car.customer.phone
                            ? `tel:${car.customer.phone}`
                            : undefined
                        }
                      />
                      <InfoItem
                        label="Email"
                        value={car.customer.email || "—"}
                        href={
                          car.customer.email
                            ? `mailto:${car.customer.email}`
                            : undefined
                        }
                      />
                      <InfoItem
                        label="Purchase Date"
                        value={
                          car.customer.purchaseDate
                            ? formatDate(car.customer.purchaseDate)
                            : "—"
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <SpecItem
                      icon={Settings2}
                      label="Engine"
                      value={car.specs?.engine || "—"}
                    />
                    <SpecItem
                      icon={Gauge}
                      label="Transmission"
                      value={car.specs?.transmission || "—"}
                    />
                    <SpecItem
                      icon={Fuel}
                      label="Fuel Type"
                      value={car.specs?.fuelType || "—"}
                    />
                    <SpecItem
                      icon={Fuel}
                      label="Fuel Consumption"
                      value={car.specs?.fuelConsumption || "—"}
                    />
                    <SpecItem
                      icon={Calendar}
                      label="Warranty"
                      value={car.specs?.warranty || "3 ans / 100 000 km"}
                    />
                  </div>
                  {car.features && car.features.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">
                        Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {car.features.map((f: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Status History Tab */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status Timeline</CardTitle>
                  <CardDescription>
                    Track the lifecycle of this vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusHistory
                    history={car.statusHistory}
                    currentStatus={car.status}
                    createdAt={car.createdAt}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>
                      COC, invoices, customs, and more
                    </CardDescription>
                  </div>
                  <Link href={`/cars/${id}`}>
                    <Button size="sm" variant="outline">
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No documents uploaded
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc: CarData) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                {doc.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {doc.type && `${doc.type} · `}
                                {doc.createdAt && formatDate(doc.createdAt)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={
                              doc.url?.startsWith("http")
                                ? doc.url
                                : `${backendBaseUrl}${doc.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Related Leads Tab */}
            <TabsContent value="leads" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Related Leads
                  </CardTitle>
                  <CardDescription>
                    Leads interested in this vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {relatedLeads.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No related leads found
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {relatedLeads.map((lead: CarData) => (
                        <Link
                          key={lead._id}
                          href={`/leads/${lead._id}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group">
                          <div>
                            <p className="text-sm font-medium text-slate-200 group-hover:text-white">
                              {lead.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {lead.email} · {lead.phone || "No phone"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={lead.status} />
                            <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Actions Sidebar */}
        <div className="space-y-4">
          {/* Price Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Selling Price</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(finalPrice)}
                  </p>
                </div>
                {costPrice > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500">Cost Price</p>
                      <p className="text-sm font-medium text-slate-300">
                        {formatCurrency(costPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Profit</p>
                      <p
                        className={`text-sm font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {formatCurrency(profit)}
                      </p>
                    </div>
                  </div>
                )}
                {discount > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-500">Discount</p>
                    <p className="text-sm font-medium text-amber-400">
                      -{formatCurrency(discount)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(() => {
                const CAR_TRANSITIONS: Record<string, { label: string; status: string; className: string }[]> = {
                  "In Transit": [
                    { label: "Mark In Stock", status: "In Stock", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" },
                  ],
                  "In Stock": [
                    { label: "Mark Reserved", status: "Reserved", className: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" },
                    { label: "Maintenance", status: "Maintenance", className: "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20" },
                  ],
                  Reserved: [
                    { label: "Back to Stock", status: "In Stock", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" },
                    { label: "Mark as Sold", status: "Sold", className: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" },
                  ],
                  Maintenance: [
                    { label: "Back to Stock", status: "In Stock", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" },
                  ],
                };
                const actions = CAR_TRANSITIONS[car.status] || [];
                if (actions.length === 0) {
                  return (
                    <p className="text-xs text-slate-500 text-center py-2">
                      No actions available — {car.status === "Sold" ? "sale completed" : "status is final"}
                    </p>
                  );
                }
                return actions.map((action) => (
                  <Button
                    key={action.status}
                    variant="outline"
                    size="sm"
                    className={`w-full justify-start border ${action.className}`}
                    onClick={() => handleStatusChange(action.status)}>
                    {action.label}
                  </Button>
                ));
              })()}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/cars/${id}/edit`} className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm">
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Car
                </Button>
              </Link>
              {brandId && (
                <Link href={`/brands/${brandId}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm">
                    <Car className="h-3.5 w-3.5 mr-2" /> View Brand
                  </Button>
                </Link>
              )}
              {modelId && (
                <Link href={`/models/${modelId}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm">
                    <Settings2 className="h-3.5 w-3.5 mr-2" /> View Model
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Car
              </Button>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardContent className="p-6 space-y-3">
              {car.createdAt && (
                <DateItem label="Added" value={formatDate(car.createdAt)} />
              )}
              {car.expectedDeliveryDate && (
                <DateItem
                  label="Expected Delivery"
                  value={formatDate(car.expectedDeliveryDate)}
                />
              )}
              {car.arrivalDate && (
                <DateItem label="Arrived" value={formatDate(car.arrivalDate)} />
              )}
              {car.soldDate && (
                <DateItem label="Sold" value={formatDate(car.soldDate)} />
              )}
              {car.updatedAt && (
                <DateItem
                  label="Last Updated"
                  value={formatDate(car.updatedAt)}
                />
              )}
            </CardContent>
          </Card>

          {/* Internal Notes */}
          {(car.internalNotes || car.customerNotes) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {car.internalNotes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Internal</p>
                    <p className="text-sm text-slate-300">
                      {car.internalNotes}
                    </p>
                  </div>
                )}
                {car.customerNotes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Customer Visible
                    </p>
                    <p className="text-sm text-slate-300">
                      {car.customerNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Car"
        message={`Are you sure you want to delete ${brandName} ${modelName}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoItem({
  label,
  value,
  href,
  mono,
}: {
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
}) {
  const content = (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p
        className={`text-sm font-medium text-slate-200 ${mono ? "font-mono" : ""} ${href ? "text-indigo-400 hover:text-indigo-300" : ""}`}>
        {value}
      </p>
    </div>
  );
  return href ? (
    <Link href={href} className="group">
      {content}
    </Link>
  ) : (
    content
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 shrink-0">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function DateItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-300">{value}</span>
    </div>
  );
}
