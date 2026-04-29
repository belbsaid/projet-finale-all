"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { carsApi, brandsApi, modelsApi, categoriesApi } from "@/lib/api";

const KNOWN_BRANDS = [
  "Audi",
  "BMW",
  "Chevrolet",
  "Citroën",
  "Dacia",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Opel",
  "Peugeot",
  "Porsche",
  "Renault",
  "Seat",
  "Škoda",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
  "BYD",
  "Chery",
  "Geely",
  "Haval",
  "MG",
  "Cupra",
  "Genesis",
  "Alfa Romeo",
  "Maserati",
];
const KNOWN_CATEGORIES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Pickup Truck",
  "Van",
  "Minivan",
  "Wagon",
  "Crossover",
  "Sport",
  "Luxury",
  "Electric",
  "Hybrid",
  "Off-Road",
  "Commercial",
];

import { CAR_STATUSES } from "./StatusCell";
import { toArray } from "@/lib/utils";
import { PhotoUpload } from "./PhotoUpload";
import { PRESET_COLORS } from "./presetColors";

const toNum = (v: unknown) => (v === "" || v === undefined ? 0 : Number(v));

const carSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  category: z.string().optional(),
  year: z.preprocess(
    toNum,
    z
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 1),
  ),
  vin: z.string().min(1, "VIN is required"),
  color: z.string().min(1, "Color is required"),
  price: z.preprocess(toNum, z.number().min(0, "Price must be positive")),
  mileage: z.preprocess(toNum, z.number().min(0)).optional(),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  engineSize: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

interface CarFormProps {
  defaultValues?: Partial<CarFormData> & { photos?: string[] };
}

interface SelectOption {

  _id?: string;
  id?: string;
  name: string;
}

export function CarForm({ defaultValues }: CarFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiBrands, setApiBrands] = useState<SelectOption[]>([]);
  const [allModels, setAllModels] = useState<SelectOption[]>([]);
  const [filteredModels, setFilteredModels] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CarFormData>({
    // @ts-expect-error – z.preprocess causes Zod resolver to infer unknown for numeric fields
    resolver: zodResolver(carSchema),
    defaultValues: {
      status: "In Stock",
      year: new Date().getFullYear(),
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        status: "In Stock",
        year: new Date().getFullYear(),
        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  /* Watch ALL select fields so we can use controlled `value` props */
  const selectedBrand = watch("brand");
  const selectedModel = watch("model");
  const selectedCategory = watch("category");
  const selectedStatus = watch("status");
  const selectedFuelType = watch("fuelType");
  const selectedTransmission = watch("transmission");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [b, m, c] = await Promise.all([
          brandsApi.getAll(),
          modelsApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setApiBrands(toArray(b));
        setAllModels(toArray(m));
        setCategories(toArray(c));
      } catch {
        toast.error("Failed to load options");
      }
    };
    loadOptions();
  }, []);

  /* Merge known brands with any existing API brands (de-duped) */
  const mergedBrands: SelectOption[] = (() => {
    const result: SelectOption[] = [];
    const seen = new Set<string>();
    // First add API brands (these have real IDs)
    for (const b of apiBrands) {
      const lc = b.name.toLowerCase();
      if (!seen.has(lc)) {
        seen.add(lc);
        result.push(b);
      }
    }
    // Then add known brands that aren't already from the API
    for (const name of KNOWN_BRANDS) {
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        result.push({ name, _id: `__known__${name}` });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  })();

  /* Merge known categories with any existing API categories (de-duped) */
  const mergedCategories: SelectOption[] = (() => {
    const result: SelectOption[] = [];
    const seen = new Set<string>();
    for (const c of categories) {
      const lc = c.name.toLowerCase();
      if (!seen.has(lc)) {
        seen.add(lc);
        result.push(c);
      }
    }
    for (const name of KNOWN_CATEGORIES) {
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        result.push({ name, _id: `__knowncat__${name}` });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  })();

  useEffect(() => {
    if (selectedBrand) {
      const filtered = allModels.filter(
        (
          m: SelectOption & { brand?: string | { _id?: string; id?: string } },
        ) => {
          const brandId =
            typeof m.brand === "object" ? m.brand?._id || m.brand?.id : m.brand;
          return brandId === selectedBrand;
        },
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels(allModels);
    }
  }, [selectedBrand, allModels]);

  /* Auto-fill category when a model is selected */
  useEffect(() => {
    if (selectedModel) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const model = allModels.find(
        (m) => (m._id || m.id) === selectedModel,
      ) as any;
      if (model?.category) {
        const catId =
          typeof model.category === "object"
            ? model.category._id || model.category.id
            : model.category;
        if (catId) setValue("category", catId);
      }
    }
  }, [selectedModel, allModels, setValue]);

  const onSubmit = async (data: CarFormData) => {
    setIsLoading(true);
    try {
      let brandId = data.brand;

      // If user selected "__custom__" or a known-brand placeholder, create the brand first
      if (brandId === "__custom__" && customBrandName.trim()) {
        const res = await brandsApi.create({ name: customBrandName.trim() });
        const created = res.data?.data || res.data?.brand || res.data;
        brandId = created?._id || created?.id || brandId;
      } else if (brandId.startsWith("__known__")) {
        // Create this known brand in the DB so it gets a real ID
        const knownName = brandId.replace("__known__", "");
        const res = await brandsApi.create({ name: knownName });
        const created = res.data?.data || res.data?.brand || res.data;
        brandId = created?._id || created?.id || brandId;
      }

      // Handle custom or known-but-unsaved category
      let categoryId = data.category || "";
      if (categoryId === "__customcat__" && customCategoryName.trim()) {
        const res = await categoriesApi.create({
          name: customCategoryName.trim(),
        });
        const created = res.data?.data || res.data?.category || res.data;
        categoryId = created?._id || created?.id || categoryId;
      } else if (categoryId.startsWith("__knowncat__")) {
        const knownName = categoryId.replace("__knowncat__", "");
        const res = await categoriesApi.create({ name: knownName });
        const created = res.data?.data || res.data?.category || res.data;
        categoryId = created?._id || created?.id || categoryId;
      }

      const payload = {
        brand: brandId,
        model: data.model,
        category: categoryId,
        year: data.year,
        vin: data.vin,
        color: data.color,
        mileage: data.mileage || 0,
        description: data.description,
        status: data.status,
        costPriceDZD: data.price,
        sellingPriceDZD: data.price,
        specs: {
          engine: data.engineSize || "",
          transmission: data.transmission || "Automatique",
          fuelType: data.fuelType || "Essence",
        },
      };

      const res = await carsApi.create(
        payload as unknown as Record<string, unknown>,
      );
      const newId =
        res.data?.data?._id ||
        res.data?._id ||
        res.data?.car?._id ||
        res.data?.car?.id;

      if (newId && pendingPhotos.length > 0) {
        const fd = new FormData();
        pendingPhotos.forEach((f) => fd.append("photos", f));
        try {
          await carsApi.uploadPhotos(newId, fd);
          toast.success("Car and photos created successfully");
        } catch {
          toast.error("Car created, but failed to upload photos");
        }
      } else {
        toast.success("Car created successfully");
      }

      if (newId) {
        router.push(`/cars/${newId}`);
        return;
      }

      router.push("/cars");

    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: { error?: { message?: string; details?: string } };
        };
      };
      const backendError = error?.response?.data?.error;
      toast.error(
        backendError?.details || backendError?.message || "Failed to save car",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    name: keyof CarFormData,
    label: string,
    type = "text",
    placeholder = "",
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={errors[name] ? "border-destructive" : ""}
      />
      {errors[name] && (
        <p className="text-xs text-destructive">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast.error("Please fill in all required fields correctly.");
    Object.keys(errors).forEach((key) => {
      if (errors[key]?.message) {
        toast.error(`${key}: ${errors[key].message}`);
      }
    });
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form
      onSubmit={handleSubmit(onSubmit as any, onError)}
      className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Brand – controlled with known brands + custom option */}
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Select
              value={selectedBrand || ""}
              onValueChange={(v) => {
                if (v === "__custom__") {
                  setShowCustomBrand(true);
                  setValue("brand", "__custom__");
                } else {
                  setShowCustomBrand(false);
                  setCustomBrandName("");
                  setValue("brand", v);
                }
              }}>
              <SelectTrigger
                className={errors.brand ? "border-destructive" : ""}>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {mergedBrands.map((b) => (
                  <SelectItem
                    key={b._id || b.id || b.name}
                    value={b._id || b.id || b.name}>
                    {b.name}
                  </SelectItem>
                ))}
                <SelectItem
                  value="__custom__"
                  className="border-t border-border mt-1 pt-1 font-medium text-indigo-400">
                  ＋ Create New Brand…
                </SelectItem>
              </SelectContent>
            </Select>
            {showCustomBrand && (
              <Input
                placeholder="Enter new brand name"
                value={customBrandName}
                onChange={(e) => setCustomBrandName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            )}
            {errors.brand && (
              <p className="text-xs text-destructive">{errors.brand.message}</p>
            )}
          </div>

          {/* Model – controlled */}
          <div className="space-y-1.5">
            <Label>Model</Label>
            <Select
              value={selectedModel || ""}
              onValueChange={(v) => setValue("model", v)}>
              <SelectTrigger
                className={errors.model ? "border-destructive" : ""}>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {(Array.isArray(filteredModels) ? filteredModels : []).map(
                  (m) => (
                    <SelectItem
                      key={m._id || m.id || ""}
                      value={m._id || m.id || ""}>
                      {m.name}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            {errors.model && (
              <p className="text-xs text-destructive">{errors.model.message}</p>
            )}
          </div>

          {/* Category – controlled with known categories + custom option */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={selectedCategory || ""}
              onValueChange={(v) => {
                if (v === "__customcat__") {
                  setShowCustomCategory(true);
                  setValue("category", "__customcat__");
                } else {
                  setShowCustomCategory(false);
                  setCustomCategoryName("");
                  setValue("category", v);
                }
              }}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {mergedCategories.map((c) => (
                  <SelectItem
                    key={c._id || c.id || c.name}
                    value={c._id || c.id || c.name}>
                    {c.name}
                  </SelectItem>
                ))}
                <SelectItem
                  value="__customcat__"
                  className="border-t border-border mt-1 pt-1 font-medium text-indigo-400">
                  ＋ Create New Category…
                </SelectItem>
              </SelectContent>
            </Select>
            {showCustomCategory && (
              <Input
                placeholder="Enter new category name"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            )}
          </div>

          {field("year", "Year", "number", "2024")}
          {field("vin", "VIN", "text", "1HGBH41JXMN109186")}

          {/* Color – controlled dropdown with presets + custom */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <Select
              value={watch("color") || ""}
              onValueChange={(v) => {
                if (v === "__custom_color__") {
                  setShowCustomColor(true);
                  setValue("color", "");
                } else {
                  setShowCustomColor(false);
                  setCustomColorName("");
                  setValue("color", v);
                }
              }}>
              <SelectTrigger className={errors.color ? "border-destructive" : ""}>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {PRESET_COLORS.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
                <SelectItem
                  value="__custom_color__"
                  className="border-t border-border mt-1 pt-1 font-medium text-indigo-400">
                  ＋ Custom Color…
                </SelectItem>
              </SelectContent>
            </Select>
            {showCustomColor && (
              <Input
                placeholder="Enter custom color name"
                value={customColorName}
                onChange={(e) => {
                  setCustomColorName(e.target.value);
                  setValue("color", e.target.value);
                }}
                className="mt-2"
                autoFocus
              />
            )}
            {errors.color && (
              <p className="text-xs text-destructive">{errors.color.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing &amp; Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("price", "Price (DZD)", "number", "2500000")}
          {field("mileage", "Mileage (km)", "number", "0")}

          {/* Status – controlled */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={selectedStatus || "In Stock"}
              onValueChange={(v) => setValue("status", v)}>
              <SelectTrigger
                className={errors.status ? "border-destructive" : ""}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CAR_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fuel Type – controlled */}
          <div className="space-y-1.5">
            <Label>Fuel Type</Label>
            <Select
              value={selectedFuelType || ""}
              onValueChange={(v) => setValue("fuelType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Essence">Gasoline / Essence</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Electrique">Electric</SelectItem>
                <SelectItem value="Hybride">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transmission – controlled */}
          <div className="space-y-1.5">
            <Label>Transmission</Label>
            <Select
              value={selectedTransmission || ""}
              onValueChange={(v) => setValue("transmission", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Automatique">Automatic</SelectItem>
                <SelectItem value="Manuelle">Manual</SelectItem>
                <SelectItem value="CVT">CVT</SelectItem>
                <SelectItem value="Dual-Clutch">Dual-Clutch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {field("engineSize", "Engine Size", "text", "2.0L")}

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Car description..."
              rows={4}
              {...register("description")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload
            initialPhotos={defaultValues?.photos || []}
            onFilesChange={setPendingPhotos}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/cars")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Car
        </Button>
      </div>
    </form>
  );
}
