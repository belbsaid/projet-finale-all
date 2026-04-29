import type { Metadata } from "next";
import { CarTable } from "@/components/cars/CarTable";

export const metadata: Metadata = { title: "Car Inventory" };

export default function CarsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Car Inventory</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your entire vehicle stock
        </p>
      </div>
      <CarTable />
    </div>
  );
}
