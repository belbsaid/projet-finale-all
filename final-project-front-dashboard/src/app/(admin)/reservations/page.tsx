import type { Metadata } from "next";
import { LeadTable } from "@/components/leads/LeadTable";

export const metadata: Metadata = { title: "Reservations" };

export default function ReservationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reservations</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage client reservations and inquiries
        </p>
      </div>
      <LeadTable />
    </div>
  );
}
