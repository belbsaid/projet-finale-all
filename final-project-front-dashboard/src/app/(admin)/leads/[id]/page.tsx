import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EditLeadClient } from "./EditLeadClient";

export const metadata: Metadata = { title: "Edit Lead" };

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Leads
        </Link>
        <h2 className="text-2xl font-bold">Edit Lead</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Update the lead information
        </p>
      </div>
      <EditLeadClient leadId={id} />
    </div>
  );
}
