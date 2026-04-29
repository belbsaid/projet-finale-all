"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { documentsApi } from "@/lib/api";
import { formatDate, toArray } from "@/lib/utils";
import { toast } from "sonner";
import { FileText, Trash2, Download, Search } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Doc {
  _id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  car?: {
    _id: string;
    model: { name: string } | string;
    brand?: { name: string } | string;
  };
  createdAt: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filtered, setFiltered] = useState<Doc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentsApi.getAll();
        const data = toArray(res);
        setDocs(data);
        setFiltered(data);
      } catch {
        // Backend may not have a GET /documents route;
        // documents are per-car, so empty is expected here
        setDocs([]);
        setFiltered([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let result = docs;
    if (search)
      result = result.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (typeFilter !== "all")
      result = result.filter((d) => d.type === typeFilter);
    setFiltered(result);
  }, [search, typeFilter, docs]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await documentsApi.delete(deleteId);
      setDocs((prev) => prev.filter((d) => d._id !== deleteId));
      toast.success("Document deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getCarLabel = (doc: Doc) => {
    if (!doc.car) return null;
    const brand = typeof doc.car.brand === "object" ? doc.car.brand.name : "";
    const model =
      typeof doc.car.model === "object" ? doc.car.model.name : doc.car.model;
    return { id: doc.car._id, label: `${brand} ${model || "—"}`.trim() || "—" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Document Vault</h2>
        <p className="text-sm text-muted-foreground mt-1">
          All uploaded car documents in one place
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Document</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((doc) => (
                  <TableRow key={doc._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {doc.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(() => {
                        const carInfo = getCarLabel(doc);
                        if (!carInfo) return "—";
                        return (
                          <Link
                            href={`/cars/${carInfo.id}`}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            {carInfo.label}
                          </Link>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatSize(doc.size)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(doc.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(doc._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the document.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
