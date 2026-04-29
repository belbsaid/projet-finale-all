"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { usersApi } from "@/lib/api";
import { formatDate, toArray } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  Shield,
  UserCircle,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

const ROLE_TABS = [
  {
    key: "All",
    label: "All Users",
    icon: Users,
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    activeColor: "bg-slate-500/20 border-slate-400 ring-1 ring-slate-400/30",
  },
  {
    key: "admin",
    label: "Admins",
    icon: Shield,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    activeColor: "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/30",
  },
  {
    key: "user",
    label: "Users",
    icon: UserCircle,
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    activeColor: "bg-indigo-500/20 border-indigo-400 ring-1 ring-indigo-400/30",
  },
];

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.getAll({ limit: "200" });
      setData(toArray(res));
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting()}>
          Name <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-700 shrink-0 text-white text-xs font-semibold">
            {row.original.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-medium text-sm">{row.original.name}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ getValue }) => {
        const role = getValue() as string;
        return (
          <Badge
            variant={role === "admin" ? "default" : "secondary"}
            className={
              role === "admin"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-slate-500/20 text-slate-400 border-slate-500/30"
            }>
            {role === "admin" ? (
              <Shield className="h-3 w-3 mr-1" />
            ) : (
              <UserCircle className="h-3 w-3 mr-1" />
            )}
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
  ];

  const filteredData =
    activeTab === "All"
      ? data
      : data.filter((u) => u.role === activeTab);

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground text-sm mt-1">
          View all registered users
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-3 gap-3">
        {ROLE_TABS.map((s) => {
          const Icon = s.icon;
          const count =
            s.key === "All"
              ? data.length
              : data.filter((u) => u.role === s.key).length;
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
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
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    const user = row.original;
                    router.push(`/users/${user._id || user.id}`);
                  }}>
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
        <p>{table.getFilteredRowModel().rows.length} user(s)</p>
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
    </div>
  );
}
