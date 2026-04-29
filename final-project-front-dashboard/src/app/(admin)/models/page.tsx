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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { modelsApi, brandsApi, categoriesApi } from "@/lib/api";
import { toast } from "sonner";
import { toArray } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Model {
  _id?: string;
  id?: string;
  name: string;
  brand: { _id?: string; id?: string; name: string } | string;
  year?: number;
}
interface Brand {
  _id?: string;
  id?: string;
  name: string;
}
interface Category {
  _id?: string;
  id?: string;
  name: string;
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Model | null>(null);
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandOrigin, setNewBrandOrigin] = useState("China");
  const [newBrandLogo, setNewBrandLogo] = useState("");
  const [newBrandDescription, setNewBrandDescription] = useState("");
  const [newBrandIsActive, setNewBrandIsActive] = useState(true);
  const [newBrandPopularity, setNewBrandPopularity] = useState(0);
  const [newBrandWarrantyYears, setNewBrandWarrantyYears] = useState(3);
  const [newBrandHasLocalServiceCenter, setNewBrandHasLocalServiceCenter] = useState(false);
  const [newBrandWebsite, setNewBrandWebsite] = useState("");
  const [isSavingBrand, setIsSavingBrand] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [m, b, c] = await Promise.all([
        modelsApi.getAll(),
        brandsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setModels(toArray(m));
      setBrands(toArray(b));
      setCategories(toArray(c));
    } catch {
      toast.error("Failed to load data");
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
    setBrandId("");
    setCategoryId("");
    setDialogOpen(true);
  };
  const openEdit = (m: Model) => {
    setEditTarget(m);
    setName(m.name);
    setBrandId(
      typeof m.brand === "object" ? m.brand._id || m.brand.id || "" : m.brand,
    );
    // Note: models API populated category? Assuming yes if not primitive
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCategoryId((m as any).category?._id || (m as any).category || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !brandId || !categoryId) return;
    setIsSaving(true);
    try {
      if (editTarget) {
        await modelsApi.update(editTarget._id || editTarget.id || "", {
          name,
          brand: brandId,
          category: categoryId,
          year: new Date().getFullYear(),
        });
        toast.success("Model updated");
      } else {
        await modelsApi.create({
          name,
          brand: brandId,
          category: categoryId,
          year: new Date().getFullYear(),
        });
        toast.success("Model created");
      }
      setDialogOpen(false);
      load();
    } catch {
      toast.error("Failed to save model");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setIsSavingBrand(true);
    try {
      await brandsApi.create({ 
        name: newBrandName, 
        origin: newBrandOrigin, 
        logo: newBrandLogo,
        description: newBrandDescription,
        isActive: newBrandIsActive,
        popularity: newBrandPopularity,
        warrantyYears: newBrandWarrantyYears,
        hasLocalServiceCenter: newBrandHasLocalServiceCenter,
        website: newBrandWebsite
      });
      
      const bRes = await brandsApi.getAll();
      const bList = toArray(bRes);
      setBrands(bList);
      
      const newB = bList.find((b: any) => b.name.toLowerCase() === newBrandName.toLowerCase());
      if (newB) {
        setBrandId(newB._id || newB.id || newB.name);
      }
      
      toast.success("Brand created");
      setIsBrandDialogOpen(false);
      setNewBrandName("");
      setNewBrandOrigin("China");
      setNewBrandLogo("");
      setNewBrandDescription("");
      setNewBrandIsActive(true);
      setNewBrandPopularity(0);
      setNewBrandWarrantyYears(3);
      setNewBrandHasLocalServiceCenter(false);
      setNewBrandWebsite("");
    } catch {
      toast.error("Failed to create brand");
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await modelsApi.delete(deleteId);
      setModels((prev) => prev.filter((m) => (m._id || m.id) !== deleteId));
      toast.success("Model deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete model");
    }
  };

  const getBrandName = (m: Model) =>
    typeof m.brand === "object"
      ? m.brand.name
      : brands.find((b) => (b._id || b.id) === m.brand)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Models</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage car models
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Model
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
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
              ) : models.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-10 text-muted-foreground">
                    No models yet
                  </TableCell>
                </TableRow>
              ) : (
                models.map((m) => (
                  <TableRow key={m._id || m.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/models/${m._id || m.id}`}
                        className="hover:text-indigo-400 transition-colors">
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getBrandName(m)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(m._id || m.id || null)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Model" : "New Model"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Camry"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Brand *</Label>
              <div className="flex items-center gap-2">
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem
                        key={b._id || b.id || b.name}
                        value={b._id || b.id || b.name || ""}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsBrandDialogOpen(true)}
                  title="Create new brand"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem
                      key={c._id || c.id || c.name}
                      value={c._id || c.id || c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim() || !brandId || !categoryId}>
              {isSaving ? "Saving..." : editTarget ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Model</DialogTitle>
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

      {/* Create Brand Dialog */}
      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Toyota"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Origin</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newBrandOrigin}
                onChange={(e) => setNewBrandOrigin(e.target.value)}>
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
                value={newBrandLogo}
                onChange={(e) => setNewBrandLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              {newBrandLogo && (
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  Preview:
                  <img src={newBrandLogo} alt="Logo preview" className="h-8 w-auto object-contain bg-white rounded border border-input p-1" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Website URL</Label>
                <Input
                  type="url"
                  value={newBrandWebsite}
                  onChange={(e) => setNewBrandWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Popularity (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newBrandPopularity}
                  onChange={(e) => setNewBrandPopularity(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Warranty Years</Label>
              <Input
                type="number"
                min="0"
                value={newBrandWarrantyYears}
                onChange={(e) => setNewBrandWarrantyYears(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={newBrandDescription}
                onChange={(e) => setNewBrandDescription(e.target.value)}
                placeholder="Brand details..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBrandIsActive}
                  onChange={(e) => setNewBrandIsActive(e.target.checked)}
                  className="rounded border-input h-4 w-4"
                />
                Is Active
              </label>
              
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBrandHasLocalServiceCenter}
                  onChange={(e) => setNewBrandHasLocalServiceCenter(e.target.checked)}
                  className="rounded border-input h-4 w-4"
                />
                Has Local Service Center
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBrandDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBrand} disabled={isSavingBrand || !newBrandName.trim()}>
              {isSavingBrand ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
