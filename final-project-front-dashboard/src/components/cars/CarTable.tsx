"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { carsApi, brandsApi, categoriesApi } from "@/lib/api";
import { formatCurrency, toArray } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Search,
  Plus,
  Car,
  Eye,
  Filter,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CarRow {
  _id?: string;
  id?: string;
  brand: { _id?: string; name: string } | string;
  model: { _id?: string; name: string } | string;
  category?: { _id?: string; name: string } | string;
  year: number;
  vin: string;
  stockNumber?: string;
  color: string;
  finalPriceDZD: number;
  sellingPriceDZD?: number;
  status: string;
  photos?: string[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SelectOption {
  _id: string;
  name: string;
}

const STATUS_TABS = [
  {
    key: "All",
    label: "All Cars",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    activeColor: "bg-slate-500/20 border-slate-400 ring-1 ring-slate-400/30",
  },
  {
    key: "In Stock",
    label: "In Stock",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    activeColor:
      "bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400/30",
  },
  {
    key: "In Transit",
    label: "In Transit",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    activeColor: "bg-blue-500/20 border-blue-400 ring-1 ring-blue-400/30",
  },
  {
    key: "Reserved",
    label: "Reserved",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    activeColor: "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/30",
  },
  {
    key: "Sold",
    label: "Sold",
    color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    activeColor: "bg-violet-500/20 border-violet-400 ring-1 ring-violet-400/30",
  },
  {
    key: "Maintenance",
    label: "Maintenance",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    activeColor: "bg-orange-500/20 border-orange-400 ring-1 ring-orange-400/30",
  },
];

const PAGE_SIZES = [10, 20, 50, 100];

export function CarTable() {
  const [data, setData] = useState<CarRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status counts for analytics cards (fetched once)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Filter state
  const [activeStatus, setActiveStatus] = useState("All");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Options for dropdowns
  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load brands + categories once
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          brandsApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setBrands(toArray(bRes));
        setCategories(toArray(cRes));
      } catch {
        /* non-critical */
      }
    };
    loadOptions();
  }, []);

  // Fetch status counts once on mount (all cars, no filter)
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const res = await carsApi.getAll({ limit: "5000" });
        const all = toArray(res);
        const counts: Record<string, number> = { All: all.length };
        for (const car of all) {
          counts[car.status] = (counts[car.status] || 0) + 1;
        }
        setStatusCounts(counts);
      } catch {
        /* non-critical */
      }
    };
    loadCounts();
  }, []);

  // Build query params from filters
  const buildParams = useCallback(
    (page: number, limit: number) => {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(limit),
      };
      if (activeStatus !== "All") params.status = activeStatus;
      if (filterBrand && filterBrand !== "all") params.brand = filterBrand;
      if (filterCategory && filterCategory !== "all") params.category = filterCategory;
      if (filterYear && filterYear !== "all") params.year = filterYear;
      if (filterColor) params.color = filterColor;
      if (filterMinPrice) params.minPrice = filterMinPrice;
      if (filterMaxPrice) params.maxPrice = filterMaxPrice;
      if (debouncedSearch) params.search = debouncedSearch;
      if (sortBy && sortBy !== "all") params.sortBy = sortBy;
      return params;
    },
    [
      activeStatus,
      filterBrand,
      filterCategory,
      filterYear,
      filterColor,
      filterMinPrice,
      filterMaxPrice,
      debouncedSearch,
      sortBy,
    ],
  );

  const fetchCars = useCallback(
    async (page = 1, limit = pagination.limit) => {
      setIsLoading(true);
      try {
        const params = buildParams(page, limit);
        const res = await carsApi.getAll(params);

        // Extract data + pagination from response
        const raw = res.data || res;
        const cars = toArray(res);
        const pag = raw.pagination || {};

        setData(cars);
        setPagination({
          page: pag.page || page,
          limit: pag.limit || limit,
          total: pag.total || cars.length,
          totalPages: pag.totalPages || 1,
        });
      } catch {
        toast.error("Failed to load cars");
      } finally {
        setIsLoading(false);
      }
    },
    [buildParams, pagination.limit],
  );

  // Re-fetch when filters or search change (reset to page 1)
  useEffect(() => {
    fetchCars(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeStatus,
    filterBrand,
    filterCategory,
    filterYear,
    filterColor,
    filterMinPrice,
    filterMaxPrice,
    debouncedSearch,
    sortBy,
  ]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await carsApi.delete(deleteId);
      setData((prev) => prev.filter((c) => c._id !== deleteId));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
      // Update status counts
      const deleted = data.find((c) => c._id === deleteId);
      if (deleted) {
        setStatusCounts((prev) => ({
          ...prev,
          All: (prev.All || 1) - 1,
          [deleted.status]: (prev[deleted.status] || 1) - 1,
        }));
      }
      toast.success("Car deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete car");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters =
    filterBrand ||
    filterCategory ||
    filterYear ||
    filterColor ||
    filterMinPrice ||
    filterMaxPrice ||
    debouncedSearch ||
    sortBy;

  const clearFilters = () => {
    setFilterBrand("");
    setFilterCategory("");
    setFilterYear("");
    setFilterColor("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setSearch("");
    setSortBy("");
  };

  // Generate year options (current year down to 2015)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 2014 },
    (_, i) => currentYear - i,
  );

  const getBrand = (car: CarRow) =>
    car.brand == null
      ? "—"
      : typeof car.brand === "object"
        ? car.brand.name
        : car.brand;
  const getModel = (car: CarRow) =>
    car.model == null
      ? "—"
      : typeof car.model === "object"
        ? car.model.name
        : car.model;

  const columns: ColumnDef<CarRow>[] = [
    {
      id: "photo",
      header: "",
      cell: ({ row }) => {
        const photo = row.original.photos?.[0];
        const backendBaseUrl = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
        ).replace("/api", "");
        return (
          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
            {photo ? (
              <img
                src={
                  photo.startsWith("http") ? photo : `${backendBaseUrl}${photo}`
                }
                alt={getModel(row.original)}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-slate-600">
                <Car className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "car",
      header: "Car",
      accessorFn: (row) => `${getBrand(row)} ${getModel(row)}`,
      cell: ({ row }) => (
        <Link
          href={`/cars/${row.original._id}`}
          className="hover:text-indigo-400 transition-colors">
          <p className="font-medium text-sm">
            {getBrand(row.original)} {getModel(row.original)}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.year} · {row.original.color}
          </p>
        </Link>
      ),
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ getValue }) => (
        <code className="text-xs px-1.5 py-0.5 rounded font-mono">
          {getValue() as number}
        </code>
      ),
    },
    {
      accessorKey: "vin",
      header: "VIN",
      cell: ({ getValue }) => (
        <code className="text-xs px-1.5 py-0.5 rounded font-mono">
          {getValue() as string}
        </code>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "finalPriceDZD",
      header: "Price",
      cell: ({ getValue }) => (
        <span className="font-semibold text-sm">
          {formatCurrency(getValue() as number)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Link href={`/cars/${row.original._id || row.original.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="View">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href={`/cars/${row.original._id || row.original.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Delete"
            onClick={() =>
              setDeleteId(row.original._id || row.original.id || null)
            }>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Status Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUS_TABS.map((s) => {
          const count =
            s.key === "All"
              ? statusCounts.All || 0
              : statusCounts[s.key] || 0;
          const isActive = activeStatus === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveStatus(s.key)}
              className={cn(
                "relative rounded-xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                isActive ? s.activeColor : s.color,
              )}>
              <div className="flex items-center justify-between mb-2">
                <Car className="h-4 w-4" />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-current" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search + Filters + Add button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by VIN or stock #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Link href="/cars/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Car
            </Button>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
          <Filter className="h-4 w-4 shrink-0" />

          {/* Brand */}
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Color */}
          <Input
            placeholder="Color"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
            className="h-8 w-[100px] text-xs"
          />

          {/* Min Price */}
          <Input
            placeholder="Min price"
            type="number"
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
            className="h-8 w-[110px] text-xs"
          />

          {/* Max Price */}
          <Input
            placeholder="Max price"
            type="number"
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
            className="h-8 w-[110px] text-xs"
          />

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low → High</SelectItem>
              <SelectItem value="price-high">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-border hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-muted-foreground">
                  No cars found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <p>
            {pagination.total} car{pagination.total !== 1 && "s"}
          </p>
          <Select
            value={String(pagination.limit)}
            onValueChange={(v) => {
              const newLimit = Number(v);
              setPagination((prev) => ({ ...prev, limit: newLimit }));
              fetchCars(1, newLimit);
            }}>
            <SelectTrigger className="h-8 w-[80px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchCars(1)}
            disabled={pagination.page <= 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchCars(pagination.page - 1)}
            disabled={pagination.page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchCars(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchCars(pagination.totalPages)}
            disabled={pagination.page >= pagination.totalPages}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Car</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this car? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
