"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { brandsApi, modelsApi, carsApi } from "@/lib/api";
import { toArray, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Globe,
  Shield,
  Layers,
  Car,
  ExternalLink,
} from "lucide-react";

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [brand, setBrand] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [models, setModels] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const brandRes = await brandsApi.getOne(id);
        const brandData =
          brandRes.data?.data || brandRes.data?.brand || brandRes.data;
        setBrand(brandData);

        // Load related models and cars
        const [modelsRes, carsRes] = await Promise.all([
          modelsApi.getAll({ brand: id }),
          carsApi.getByBrand(id),
        ]);
        setModels(toArray(modelsRes));
        setCars(toArray(carsRes));
      } catch {
        toast.error("Failed to load brand details");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) return <LoadingSpinner label="Loading brand..." />;
  if (!brand) {
    return (
      <div className="text-center py-20">
        <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Brand not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumbs entityName={brand.name} />

      {/* Brand Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 shrink-0">
              <Building2 className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{brand.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {brand.origin && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Globe className="h-3.5 w-3.5" />
                    {brand.origin}
                  </div>
                )}
                {brand.warrantyYears && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Shield className="h-3.5 w-3.5" />
                    {brand.warrantyYears} yr warranty
                  </div>
                )}
                {brand.hasServiceCenter !== undefined && (
                  <Badge
                    variant={brand.hasServiceCenter ? "default" : "secondary"}>
                    {brand.hasServiceCenter
                      ? "Has Service Center"
                      : "No Service Center"}
                  </Badge>
                )}
              </div>
              {brand.description && (
                <p className="text-sm text-slate-400 mt-3">
                  {brand.description}
                </p>
              )}
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 mt-2">
                  <ExternalLink className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Models
            <Badge variant="secondary" className="ml-1">
              {models.length}
            </Badge>
          </CardTitle>
          <CardDescription>All car models from {brand.name}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {models.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No models"
              message={`No models found for ${brand.name}`}
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((m) => (
                  <TableRow key={m._id} className="group">
                    <TableCell>
                      <Link
                        href={`/models/${m._id}`}
                        className="text-sm font-medium text-slate-200 hover:text-indigo-400 transition-colors">
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">
                      {m.year || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/models/${m._id}`}>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-600 hover:text-slate-300 inline" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Related Cars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-4 w-4" /> Cars
            <Badge variant="secondary" className="ml-1">
              {cars.length}
            </Badge>
          </CardTitle>
          <CardDescription>All cars from {brand.name}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {cars.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No cars"
              message={`No cars found for ${brand.name}`}
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Car</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((c) => {
                  const model =
                    typeof c.model === "object" ? c.model.name : c.model;
                  return (
                    <TableRow key={c._id} className="group">
                      <TableCell>
                        <Link
                          href={`/cars/${c._id}`}
                          className="text-sm font-medium text-slate-200 hover:text-indigo-400 transition-colors">
                          {brand.name} {model}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {c.color} · {c.vin}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-400">
                        {c.year}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(
                          c.finalPriceDZD || c.sellingPriceDZD || 0,
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/cars/${c._id}`}>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-600 hover:text-slate-300 inline" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
