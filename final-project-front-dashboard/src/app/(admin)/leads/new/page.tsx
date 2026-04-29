import type { Metadata } from "next";
import { LeadForm } from "@/components/leads/LeadForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "New Lead" };

export default function NewLeadPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Leads
        </Link>
        <h2 className="text-2xl font-bold">Add New Lead</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details to create a new lead
        </p>
      </div>
      <LeadForm />
    </div>
  );
}
