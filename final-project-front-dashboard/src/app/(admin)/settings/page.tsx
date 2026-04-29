"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { Loader2, Shield, User } from "lucide-react";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "At least 6 characters"),
    newPassword: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string().min(6, "At least 6 characters"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isChangingPw, setIsChangingPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const handlePasswordChange = async (data: PasswordForm) => {
    setIsChangingPw(true);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully");
      reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-700 text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="inline-flex items-center gap-1 text-xs text-indigo-400 mt-1 font-medium capitalize">
                <Shield className="h-3 w-3" /> {user?.role}
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={user?.name || ""}
                readOnly
                className="bg-muted/50 cursor-default"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                readOnly
                className="bg-muted/50 cursor-default"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input
                value={user?.role || ""}
                readOnly
                className="bg-muted/50 cursor-default capitalize"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(handlePasswordChange)}
            className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("currentPassword")}
                className={errors.currentPassword ? "border-destructive" : ""}
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("newPassword")}
                className={errors.newPassword ? "border-destructive" : ""}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isChangingPw}>
                {isChangingPw && <Loader2 className="h-4 w-4 animate-spin" />}
                {isChangingPw ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AutoShip DZ Admin</p>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
            <p className="text-xs text-muted-foreground">© 2025 AutoShip DZ</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
