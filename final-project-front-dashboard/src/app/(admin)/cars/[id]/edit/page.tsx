import { EditCarClient } from "./EditCarClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Car" };

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href={`/cars/${id}`} // User requested going edit directly, this acts as the "cancel" navigation.
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Car Details
        </Link>
        <h2 className="text-2xl font-bold">Edit Car</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Update the vehicle&apos;s details and specifications
        </p>
      </div>
      <EditCarClient carId={id} />
    </div>
  );
}
