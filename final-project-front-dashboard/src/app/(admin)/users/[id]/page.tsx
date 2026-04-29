"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usersApi, leadsApi } from "@/lib/api";
import { toArray, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  User,
  Mail,
  Phone,
  Shield,
  UserCircle,
  Calendar,
  CalendarCheck,
  Car,
  ChevronLeft,
  ExternalLink,
  Clock,
} from "lucide-react";

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning (9:00 – 12:00)",
  afternoon: "Afternoon (13:00 – 17:00)",
  evening: "Evening (17:00 – 20:00)",
};

/**
 * Extracts a display label and optional link ID from a reservation's car data.
 * If carId is a populated object → use brand+model name and provide link.
 * If carId is a plain string or null → fall back to interestedModel text.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCarInfo(reservation: any): {
  label: string;
  linkId: string | null;
} {
  const carId = reservation.carId;

  // carId is a populated object with brand/model from the backend populate
  if (carId && typeof carId === "object" && carId._id) {
    const brand =
      typeof carId.brand === "object" ? carId.brand?.name : carId.brand;
    const model =
      typeof carId.model === "object" ? carId.model?.name : carId.model;
    const label =
      [brand, model].filter(Boolean).join(" ") || carId.stockNumber || "Unknown Car";
    return { label, linkId: carId._id };
  }

  // carId is a bare ObjectId string (not populated, or car was deleted)
  // Fall back to the interestedModel text field
  return {
    label: reservation.interestedModel || "—",
    linkId: null,
  };
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch user info
        const userRes = await usersApi.getOne(id);
        const userData =
          userRes.data?.data || userRes.data?.user || userRes.data;
        setUser(userData);

        if (!userData) {
          setIsLoading(false);
          return;
        }

        // Fetch reservations (leads) matching this user by:
        // - submittedBy (user ID)
        // - OR email match
        // - OR phone match
        // This catches leads created from public forms (no submittedBy)
        const params: Record<string, string> = {
          limit: "200",
          forUser: id,
        };
        if (userData.email) params.forUserEmail = userData.email;
        if (userData.phone) params.forUserPhone = userData.phone;

        const leadsRes = await leadsApi.getAll(params);
        setReservations(toArray(leadsRes));
      } catch {
        toast.error("Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // Set browser tab title to user name
  useEffect(() => {
    if (user?.name) {
      document.title = `${user.name} — Users`;
    }
    return () => {
      document.title = "Dashboard";
    };
  }, [user]);

  if (isLoading) return <LoadingSpinner label="Loading user..." />;
  if (!user) {
    return (
      <div className="text-center py-20">
        <User className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">User not found</p>
      </div>
    );
  }

  // Derive unique interested cars from reservations (only those with a real populated carId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interestedCars: any[] = [];
  const seenCarIds = new Set<string>();
  for (const r of reservations) {
    if (r.carId && typeof r.carId === "object" && r.carId._id) {
      if (!seenCarIds.has(r.carId._id)) {
        seenCarIds.add(r.carId._id);
        interestedCars.push(r.carId);
      }
    }
  }

  // Also collect unique interestedModel strings that DON'T have a matching car
  const interestedModelNames: string[] = [];
  const seenModelNames = new Set<string>();
  for (const r of reservations) {
    if (r.interestedModel && (!r.carId || typeof r.carId === "string")) {
      const name = r.interestedModel.trim();
      if (name && !seenModelNames.has(name.toLowerCase())) {
        seenModelNames.add(name.toLowerCase());
        interestedModelNames.push(name);
      }
    }
  }

  const totalReservations = reservations.length;
  const activeReservations = reservations.filter(
    (r) => r.status !== "Lost" && r.status !== "Sold",
  ).length;
  const completedReservations = reservations.filter(
    (r) => r.status === "Sold",
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Users
      </Link>

      {/* User Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 shrink-0 text-indigo-400 text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className={
                    user.role === "admin"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                  }>
                  {user.role === "admin" ? (
                    <Shield className="h-3 w-3 mr-1" />
                  ) : (
                    <UserCircle className="h-3 w-3 mr-1" />
                  )}
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {user.email && (
                  <a
                    href={`mailto:${user.email}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm text-slate-200">{user.email}</p>
                    </div>
                  </a>
                )}
                {user.phone && (
                  <a
                    href={`https://wa.me/${user.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
                    <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs text-emerald-500">Phone</p>
                      <p className="text-sm text-emerald-300">{user.phone}</p>
                    </div>
                  </a>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Joined</p>
                      <p className="text-sm text-slate-200">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-slate-500/10 border-slate-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <CalendarCheck className="h-4 w-4 text-slate-400" />
            <span className="text-2xl font-bold text-slate-300">
              {totalReservations}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Total Reservations
          </p>
        </div>
        <div className="rounded-xl border bg-indigo-500/10 border-indigo-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span className="text-2xl font-bold text-indigo-300">
              {activeReservations}
            </span>
          </div>
          <p className="text-xs font-medium text-indigo-500">Active</p>
        </div>
        <div className="rounded-xl border bg-emerald-500/10 border-emerald-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <Car className="h-4 w-4 text-emerald-400" />
            <span className="text-2xl font-bold text-emerald-300">
              {completedReservations}
            </span>
          </div>
          <p className="text-xs font-medium text-emerald-500">Sold</p>
        </div>
      </div>

      {/* Interested Cars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-4 w-4" /> Interested Cars
            <Badge variant="secondary" className="ml-1">
              {interestedCars.length + interestedModelNames.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Cars that {user.name} has shown interest in
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {interestedCars.length === 0 && interestedModelNames.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No cars"
              message="This user hasn't shown interest in any specific cars yet"
              className="py-10"
            />
          ) : (
            <div className="divide-y divide-border">
              {/* Cars with real DB entries — clickable */}
              {interestedCars.map((car) => {
                const brand =
                  typeof car.brand === "object" ? car.brand?.name : car.brand;
                const model =
                  typeof car.model === "object" ? car.model?.name : car.model;
                return (
                  <Link
                    key={car._id}
                    href={`/cars/${car._id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      {car.photos && car.photos.length > 0 ? (
                        <img
                          src={
                            car.photos[0].startsWith("http")
                              ? car.photos[0]
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${car.photos[0]}`
                          }
                          alt={`${brand} ${model}`}
                          className="w-14 h-10 rounded-lg object-cover bg-slate-800"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-14 h-10 rounded-lg bg-slate-800">
                          <Car className="h-5 w-5 text-slate-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                          {brand} {model}
                        </p>
                        <p className="text-xs text-slate-500">
                          {car.year} · {car.color} · {car.stockNumber || "—"}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </Link>
                );
              })}

              {/* Cars without a DB match — just show the model name text */}
              {interestedModelNames.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-3 p-4 text-muted-foreground">
                  <div className="flex items-center justify-center w-14 h-10 rounded-lg bg-slate-800/60">
                    <Car className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">{name}</p>
                    <p className="text-xs text-slate-600">
                      No matching car in inventory
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" /> Reservations
            <Badge variant="secondary" className="ml-1">
              {reservations.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            All reservations made by {user.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {reservations.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No reservations"
              message="This user hasn't made any reservations yet"
              className="py-10"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Car</TableHead>
                  <TableHead>Reservation Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((r) => {
                  const { label, linkId } = getCarInfo(r);
                  return (
                    <TableRow key={r._id} className="border-border">
                      <TableCell>
                        {linkId ? (
                          <Link
                            href={`/cars/${linkId}`}
                            className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                            <Car className="h-3.5 w-3.5" />
                            {label}
                          </Link>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Car className="h-3.5 w-3.5" />
                            {label}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.reservationDate ? (
                          <div>
                            <p className="text-sm">
                              {formatDate(r.reservationDate)}
                            </p>
                            {r.reservationTimeSlot && (
                              <p className="text-xs text-muted-foreground">
                                {TIME_SLOT_LABELS[r.reservationTimeSlot] ||
                                  r.reservationTimeSlot}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {r.source || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(r.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/reservations/${r._id}`}
                          className="text-slate-500 hover:text-slate-300 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5 inline" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
