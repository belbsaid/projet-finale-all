import type { Metadata } from "next";
import { LeadTable } from "@/components/leads/LeadTable";

export const metadata: Metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Leads</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage customer enquiries
        </p>
      </div>
      <LeadTable />
    </div>
  );
}
