"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { brandsApi } from "@/lib/api";
import { toast } from "sonner";
import { toArray } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Brand {
  _id: string;
  name: string;
  origin?: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
  popularity?: number;
  warrantyYears?: number;
  hasLocalServiceCenter?: boolean;
  website?: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("China");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [popularity, setPopularity] = useState(0);
  const [warrantyYears, setWarrantyYears] = useState(3);
  const [hasLocalServiceCenter, setHasLocalServiceCenter] = useState(false);
  const [website, setWebsite] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await brandsApi.getAll();
      setBrands(toArray(res));
    } catch {
      toast.error("Failed to load brands");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setName("");
    setOrigin("China");
    setLogo("");
    setDescription("");
    setIsActive(true);
    setPopularity(0);
    setWarrantyYears(3);
    setHasLocalServiceCenter(false);
    setWebsite("");
    setDialogOpen(true);
  };
  const openEdit = (b: Brand) => {
    setEditTarget(b);
    setName(b.name);
    setOrigin(b.origin || "China");
    setLogo(b.logo || "");
    setDescription(b.description || "");
    setIsActive(b.isActive ?? true);
    setPopularity(b.popularity ?? 0);
    setWarrantyYears(b.warrantyYears ?? 3);
    setHasLocalServiceCenter(b.hasLocalServiceCenter ?? false);
    setWebsite(b.website || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        name,
        origin,
        logo,
        description,
        isActive,
        popularity,
        warrantyYears,
        hasLocalServiceCenter,
        website,
      };
      if (editTarget) {
        await brandsApi.update(editTarget._id, payload);
        toast.success("Brand updated");
      } else {
        await brandsApi.create(payload);
        toast.success("Brand created");
      }
      setDialogOpen(false);
      load();
    } catch {
      toast.error("Failed to save brand");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await brandsApi.delete(deleteId);
      setBrands((prev) => prev.filter((b) => b._id !== deleteId));
      toast.success("Brand deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete brand");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brands</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage car brands
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Brand
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-10 text-muted-foreground">
                    No brands yet
                  </TableCell>
                </TableRow>
              ) : (
                (Array.isArray(brands) ? brands : []).map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {b.logo ? (
                          <img
                            src={b.logo}
                            alt={b.name}
                            className="h-8 w-8 rounded object-contain bg-white"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted/20 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              No img
                            </span>
                          </div>
                        )}
                        <Link
                          href={`/brands/${b._id}`}
                          className="hover:text-indigo-400 transition-colors">
                          {b.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.origin || "China"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(b)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(b._id)}>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Brand" : "New Brand"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Toyota"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Origin</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}>
                <option value="China">China</option>
                <option value="Japan">Japan</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Korea">Korea</option>
                <option value="USA">USA</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <Input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              {logo && (
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  Preview:
                  <img
                    src={logo}
                    alt="Logo preview"
                    className="h-8 w-auto object-contain bg-white rounded border border-input p-1"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    onLoad={(e) => (e.currentTarget.style.display = "block")}
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Website URL</Label>
                <Input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Popularity (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={popularity}
                  onChange={(e) => setPopularity(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Warranty Years</Label>
              <Input
                type="number"
                min="0"
                value={warrantyYears}
                onChange={(e) => setWarrantyYears(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brand details..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-input h-4 w-4"
                />
                Is Active
              </label>
              
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLocalServiceCenter}
                  onChange={(e) => setHasLocalServiceCenter(e.target.checked)}
                  className="rounded border-input h-4 w-4"
                />
                Has Local Service Center
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
              {isSaving ? "Saving..." : editTarget ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure? This may affect linked cars.
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
