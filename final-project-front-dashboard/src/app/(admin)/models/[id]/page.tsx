"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { modelsApi, carsApi } from "@/lib/api";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  Car,
  Building2,
  Calendar,
  Fuel,
  Gauge,
  Settings2,
  ExternalLink,
  Search,
  X,
  Filter,
} from "lucide-react";

const CAR_STATUSES = [
  "In Transit",
  "In Stock",
  "Reserved",
  "Sold",
  "Maintenance",
  "Damaged",
];
const FUEL_TYPES = ["Essence", "Diesel", "Hybride", "Electrique"];
const TRANSMISSIONS = ["Manuelle", "Automatique", "CVT", "Dual-Clutch"];

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [model, setModel] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFuel, setFilterFuel] = useState("");
  const [filterTransmission, setFilterTransmission] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const modelRes = await modelsApi.getOne(id);
        const modelData =
          modelRes.data?.data || modelRes.data?.model || modelRes.data;
        setModel(modelData);

        // Load related cars
        const carsRes = await carsApi.getByModel(id);
        setCars(toArray(carsRes));
      } catch {
        toast.error("Failed to load model details");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // Extract unique values for filter options
  const uniqueYears = useMemo(() => {
    const years = [...new Set(cars.map((c) => c.year))].filter(Boolean).sort((a, b) => b - a);
    return years;
  }, [cars]);

  const uniqueColors = useMemo(() => {
    const colors = [...new Set(cars.map((c) => c.color))].filter(Boolean).sort();
    return colors;
  }, [cars]);

  // Apply filters client-side
  const filteredCars = useMemo(() => {
    return cars.filter((c) => {
      // Text search on VIN, stock number, color
      if (search) {
        const q = search.toLowerCase();
        const vin = (c.vin || "").toLowerCase();
        const stock = (c.stockNumber || "").toLowerCase();
        const color = (c.color || "").toLowerCase();
        if (!vin.includes(q) && !stock.includes(q) && !color.includes(q)) return false;
      }
      if (filterYear && c.year !== Number(filterYear)) return false;
      if (filterColor && c.color !== filterColor) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterFuel) {
        const fuel = c.specs?.fuelType || "";
        if (fuel !== filterFuel) return false;
      }
      if (filterTransmission) {
        const trans = c.specs?.transmission || "";
        if (trans !== filterTransmission) return false;
      }
      if (filterMinPrice) {
        const price = c.finalPriceDZD || c.sellingPriceDZD || 0;
        if (price < Number(filterMinPrice)) return false;
      }
      if (filterMaxPrice) {
        const price = c.finalPriceDZD || c.sellingPriceDZD || 0;
        if (price > Number(filterMaxPrice)) return false;
      }
      return true;
    });
  }, [cars, search, filterYear, filterColor, filterStatus, filterFuel, filterTransmission, filterMinPrice, filterMaxPrice]);

  const hasActiveFilters = search || filterYear || filterColor || filterStatus || filterFuel || filterTransmission || filterMinPrice || filterMaxPrice;

  const clearFilters = () => {
    setSearch("");
    setFilterYear("");
    setFilterColor("");
    setFilterStatus("");
    setFilterFuel("");
    setFilterTransmission("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
  };

  if (isLoading) return <LoadingSpinner label="Loading model..." />;
  if (!model) {
    return (
      <div className="text-center py-20">
        <Layers className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Model not found</p>
      </div>
    );
  }

  const brandName =
    typeof model.brand === "object" ? model.brand.name : model.brand;
  const brandId = typeof model.brand === "object" ? model.brand._id : null;
  const categoryName =
    typeof model.category === "object" ? model.category?.name : model.category;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumbs entityName={model.name} />

      {/* Model Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/10 shrink-0">
              <Layers className="h-8 w-8 text-violet-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{model.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {brandName && (
                  <Link
                    href={brandId ? `/brands/${brandId}` : "#"}
                    className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Building2 className="h-3.5 w-3.5" />
                    {brandName}
                  </Link>
                )}
                {categoryName && (
                  <Badge variant="secondary">{categoryName}</Badge>
                )}
                {model.year && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {model.year}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <SpecItem
              icon={Settings2}
              label="Engine"
              value={model.engine || "—"}
            />
            <SpecItem
              icon={Gauge}
              label="Transmission"
              value={model.transmission || "—"}
            />
            <SpecItem
              icon={Fuel}
              label="Fuel Type"
              value={model.fuelType || "—"}
            />
            <SpecItem
              icon={Fuel}
              label="Fuel Consumption"
              value={model.fuelConsumption || "—"}
            />
            <SpecItem
              icon={Calendar}
              label="Warranty"
              value={model.warranty || "—"}
            />
          </div>
          {model.features && model.features.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {model.features.map((f: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Cars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-4 w-4" /> Cars
            <Badge variant="secondary" className="ml-1">
              {filteredCars.length}
              {hasActiveFilters ? ` of ${cars.length}` : ""}
            </Badge>
          </CardTitle>
          <CardDescription>All cars of the {model.name} model</CardDescription>
        </CardHeader>

        {/* Filter Bar */}
        {cars.length > 0 && (
          <div className="px-6 pb-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" /> Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Search */}
              <div className="relative col-span-2 sm:col-span-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="VIN / Stock #"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>

              {/* Year */}
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Color */}
              <Select value={filterColor} onValueChange={setFilterColor}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {uniqueColors.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {CAR_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Fuel Type */}
              <Select value={filterFuel} onValueChange={setFilterFuel}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Fuel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fuel Types</SelectItem>
                  {FUEL_TYPES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Transmission */}
              <Select value={filterTransmission} onValueChange={setFilterTransmission}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {TRANSMISSIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Min Price */}
              <Input
                placeholder="Min price"
                type="number"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                className="h-9 text-sm"
              />

              {/* Max Price */}
              <Input
                placeholder="Max price"
                type="number"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}

        <CardContent className="p-0">
          {filteredCars.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No cars"
              message={hasActiveFilters ? "No cars match your filters" : `No cars found for ${model.name}`}
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Car</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCars.map((c) => {
                  const cBrand =
                    typeof c.brand === "object" ? c.brand.name : c.brand;
                  return (
                    <TableRow key={c._id}>
                      <TableCell>
                        <Link
                          href={`/cars/${c._id}`}
                          className="text-sm font-medium text-slate-200 hover:text-indigo-400 transition-colors">
                          {cBrand} {model.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {c.stockNumber || c.vin}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-400">
                        {c.year}
                      </TableCell>
                      <TableCell className="text-sm text-slate-400">
                        {c.color}
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
