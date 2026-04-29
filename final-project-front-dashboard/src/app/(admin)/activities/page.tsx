import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ActivitiesPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Breadcrumbs />
      <Card className="flex-1 flex flex-col mb-4 bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-800/60 bg-slate-900/20">
          <CardTitle>All Activity</CardTitle>
          <CardDescription>
            Comprehensive timeline of system events, including reservations, car updates, and inventory changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex-1">
          {/* We fetch up to 100 recent activities for the full view */}
          <ActivityFeed limit={100} compact={false} />
        </CardContent>
      </Card>
    </div>
  );
}
