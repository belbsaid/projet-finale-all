import type { Metadata } from "next";
import { CarForm } from "@/components/cars/CarForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "New Car" };

export default function NewCarPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/cars"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Inventory
        </Link>
        <h2 className="text-2xl font-bold">Add New Car</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details to add a vehicle to inventory
        </p>
      </div>
      <CarForm />
    </div>
  );
}
