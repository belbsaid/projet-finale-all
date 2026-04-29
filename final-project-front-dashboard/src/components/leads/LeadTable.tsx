"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
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
import { LeadStatusBadge } from "./LeadStatusBadge";
import { leadsApi } from "@/lib/api";
import { formatDate, toArray } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowUpDown,
  Plus,
  Pencil,
  Sparkles,
  Phone,
  Store,
  ShoppingCart,
  XCircle,
  CalendarCheck,
  Car,
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


interface Lead {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  interestedModel?: string;
  status: string;
  source?: string;
  message?: string;
  createdAt: string;
  reservationDate?: string;
  reservationTimeSlot?: string;
  carId?: {
    _id?: string;
    stockNumber?: string;
    brand?: { name?: string } | string;
    model?: { name?: string } | string;
    year?: number;
    color?: string;
    photos?: string[];
  } | string;
}



const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const STATUS_ANALYTICS = [
  {
    key: "All",
    label: "All",
    icon: CalendarCheck,
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    activeColor: "bg-slate-500/20 border-slate-400 ring-1 ring-slate-400/30",
  },
  {
    key: "New",
    label: "New",
    icon: Sparkles,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    activeColor: "bg-blue-500/20 border-blue-400 ring-1 ring-blue-400/30",
  },
  {
    key: "Contacted",
    label: "Contacted",
    icon: Phone,
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    activeColor: "bg-indigo-500/20 border-indigo-400 ring-1 ring-indigo-400/30",
  },
  {
    key: "Visited Store",
    label: "Visited Store",
    icon: Store,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    activeColor: "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/30",
  },
  {
    key: "Sold",
    label: "Sold",
    icon: ShoppingCart,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    activeColor: "bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400/30",
  },
  {
    key: "Lost",
    label: "Lost",
    icon: XCircle,
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    activeColor: "bg-red-500/20 border-red-400 ring-1 ring-red-400/30",
  },
];

function getCarLabel(carId: Lead["carId"]): string {
  if (!carId || typeof carId === "string") return "—";
  const brand = typeof carId.brand === "object" ? carId.brand?.name : carId.brand;
  const model = typeof carId.model === "object" ? carId.model?.name : carId.model;
  return [brand, model].filter(Boolean).join(" ") || carId.stockNumber || "—";
}

export function LeadTable() {
  const router = useRouter();
  const [data, setData] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await leadsApi.getAll();
      setData(toArray(res));
    } catch {
      toast.error("Failed to load reservations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);



  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await leadsApi.delete(deleteId);
      setData((prev) => prev.filter((l) => l._id !== deleteId));
      toast.success("Reservation deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete reservation");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Lead>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting()}>
          Client <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      id: "car",
      header: "Car",
      cell: ({ row }) => {
        const carId = row.original.carId;
        const label = getCarLabel(carId);
        const carObjId = carId && typeof carId === "object" ? carId._id : null;
        return carObjId ? (
          <Link
            href={`/cars/${carObjId}`}
            className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            <Car className="h-3.5 w-3.5" />
            {label}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5" />
            {row.original.interestedModel || "—"}
          </span>
        );
      },
    },
    {
      id: "reservationDate",
      header: "Reservation",
      cell: ({ row }) => {
        const date = row.original.reservationDate;
        const slot = row.original.reservationTimeSlot;
        if (!date) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div>
            <p className="text-sm">{formatDate(date)}</p>
            {slot && (
              <p className="text-xs text-muted-foreground">
                {TIME_SLOT_LABELS[slot] || slot}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <LeadStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      // stop propagation so delete/pencil don't double-navigate
      cell: ({ row }) => (
        <div
          className="flex items-center gap-1 justify-end"
          onClick={(e) => e.stopPropagation()}>
          <Link href={`/reservations/${row.original._id || row.original.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() =>
              setDeleteId(row.original._id || row.original.id || null)
            }>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  /* filter data by active tab */
  const filteredData =
    activeTab === "All"
      ? data
      : data.filter((lead) => lead.status === activeTab);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUS_ANALYTICS.map((s) => {
          const Icon = s.icon;
          const count =
            s.key === "All"
              ? data.length
              : data.filter((l) => l.status === s.key).length;
          const isActive = activeTab === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveTab(s.key)}
              className={cn(
                "relative rounded-xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                isActive ? s.activeColor : s.color,
              )}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4" />
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

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/reservations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </Link>
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
                  No reservations found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const leadId = row.original._id || row.original.id;
                return (
                  <TableRow
                    key={row.id}
                    className="border-border cursor-pointer transition-colors hover:bg-muted/60"
                    onClick={() => leadId && router.push(`/reservations/${leadId}`)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>{table.getFilteredRowModel().rows.length} reservation(s)</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reservation</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure? This action cannot be undone.
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
