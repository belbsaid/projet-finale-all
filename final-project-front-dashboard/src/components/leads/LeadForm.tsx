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

import { leadsApi, carsApi } from "@/lib/api";
import { toArray } from "@/lib/utils";

/* ── schema ─────────────────────────────────────────── */

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(
      /^\+213\s?[5679]\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
      "Invalid Algerian phone (e.g. +213 5XX XX XX XX)",
    ),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  message: z.string().optional(),
  interestedModel: z.string().min(1, "Interested model is required"),
  carId: z.string().optional(),
  status: z.string().default("New"),
  source: z.string().default("Website Form"),
});

type LeadFormData = z.infer<typeof leadSchema>;

/* ── types ──────────────────────────────────────────── */

interface CarOption {
  _id: string;
  brand: string | { name: string };
  model: string | { name: string };
  year: number;
  vin: string;
}

interface LeadFormProps {
  leadId?: string;
  defaultValues?: Partial<LeadFormData>;
}

/* ── component ──────────────────────────────────────── */

export function LeadForm({ leadId, defaultValues }: LeadFormProps) {
  const router = useRouter();
  const isEdit = !!leadId;
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState<CarOption[]>([]);

  /* fetch cars for the dropdown */
  useEffect(() => {
    carsApi
      .getAll()
      .then((res) => setCars(toArray(res)))
      .catch(() => console.error("Failed to load cars"));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeadFormData>({
    // @ts-expect-error – zod resolver optional-field mismatch
    resolver: zodResolver(leadSchema),
    defaultValues: {
      status: "New",
      source: "Website Form",
      ...defaultValues,
    },
  });

  /* ── submit ────────────────────────────────────────── */

  const onSubmit = async (data: LeadFormData) => {
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = { ...data };
      if (!payload.email) delete payload.email;
      if (!payload.message) delete payload.message;
      if (!payload.carId) delete payload.carId;

      if (isEdit) {
        await leadsApi.update(leadId!, payload);
        toast.success("Lead updated successfully");
      } else {
        await leadsApi.create(payload);
        toast.success("Lead created successfully");
      }
      router.push("/leads");
      router.refresh();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: { error?: { message?: string; details?: string } };
        };
      };
      const msg = error?.response?.data?.error;
      toast.error(msg?.details || msg?.message || "Failed to save lead");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── helpers ───────────────────────────────────────── */

  const getBrand = (car: CarOption) =>
    typeof car.brand === "object" ? car.brand.name : car.brand;
  const getModel = (car: CarOption) =>
    typeof car.model === "object" ? car.model.name : car.model;

  const field = (
    name: keyof LeadFormData,
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

  /* ── render ────────────────────────────────────────── */

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("name", "Full Name", "text", "John Doe")}
          {field("phone", "Phone", "text", "+213 5XX XX XX XX")}
          {field("email", "Email (Optional)", "email", "john@example.com")}
        </CardContent>
      </Card>

      {/* Car Interest */}
      <Card>
        <CardHeader>
          <CardTitle>Interest &amp; Source</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pick from inventory */}
          <div className="space-y-1.5">
            <Label>Pick from Inventory (Optional)</Label>
            <Select
              onValueChange={(val) => {
                if (val === "__none__") {
                  setValue("carId", undefined);
                  return;
                }
                const car = cars.find((c) => c._id === val);
                if (car) {
                  setValue("carId", car._id);
                  setValue(
                    "interestedModel",
                    `${getBrand(car)} ${getModel(car)} ${car.year}`,
                  );
                }
              }}
              defaultValue={defaultValues?.carId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a car…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  — None (type manually below) —
                </SelectItem>
                {cars.map((car) => (
                  <SelectItem key={car._id} value={car._id}>
                    {getBrand(car)} {getModel(car)} {car.year} – {car.vin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Picking a car auto-fills the model field
            </p>
          </div>

          {/* Free-text fallback */}
          {field(
            "interestedModel",
            "Interested Model",
            "text",
            "e.g. Golf 8 R",
          )}

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              onValueChange={(v) => setValue("status", v)}
              defaultValue={defaultValues?.status || "New"}>
              <SelectTrigger
                className={errors.status ? "border-destructive" : ""}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {["New", "Contacted", "Visited Store", "Sold", "Lost"].map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select
              onValueChange={(v) => setValue("source", v)}
              defaultValue={defaultValues?.source || "Website Form"}>
              <SelectTrigger
                className={errors.source ? "border-destructive" : ""}>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {["Website Form", "WhatsApp", "Meeting Booking"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Message / Notes (Optional)</Label>
            <Textarea
              placeholder="Any additional notes…"
              rows={4}
              {...register("message")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/leads")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
