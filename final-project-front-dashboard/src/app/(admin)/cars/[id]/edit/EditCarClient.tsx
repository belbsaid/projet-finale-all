"use client";

import { useEffect, useState } from "react";
import { EditCarForm } from "@/components/cars/EditCarForm";
import { carsApi } from "@/lib/api";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Car } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EditCarClient({ carId }: { carId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carsApi
      .getOne(carId)
      .then((res) => {
        const car = res.data?.data || res.data?.car || res.data;
        // Transform the nested objects into IDs so CarForm can set its select fields correctly
        const defaultValues = {
          ...car,
          brand:
            typeof car?.brand === "object"
              ? car?.brand?._id || car?.brand?.id
              : car?.brand,
          model:
            typeof car?.model === "object"
              ? car?.model?._id || car?.model?.id
              : car?.model,
          category:
            typeof car?.category === "object"
              ? car?.category?._id || car?.category?.id
              : car?.category,
          price: car?.sellingPriceDZD || car?.finalPriceDZD || 0,
        };
        // Unpack specs onto root if needed by CarForm (CarForm expects fuelType, transmission, engineSize on root)
        if (car?.specs) {
          defaultValues.fuelType = car.specs.fuelType;
          defaultValues.transmission = car.specs.transmission;
          defaultValues.engineSize = car.specs.engine;
        }

        setData(defaultValues);
      })
      .catch(() => toast.error("Failed to load car details"))
      .finally(() => setIsLoading(false));
  }, [carId]);

  if (isLoading) {
    return <LoadingSpinner label="Loading car data..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <Car className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Car not found</p>
        <Link href={`/cars/${carId}`}>
          <Button variant="outline" className="mt-4">
            Back to Car Info
          </Button>
        </Link>
      </div>
    );
  }

  return <EditCarForm carId={carId} defaultValues={data} />;
}
