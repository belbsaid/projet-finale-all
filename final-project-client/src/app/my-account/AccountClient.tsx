"use client";

import { Lock, User, Phone, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

export default function AccountClient() {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: "4rem 1.5rem", maxWidth: "500px", textAlign: "center" }}>
        <div className="glass-card" style={{ padding: "3rem" }}>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", color: "var(--text-muted)" }}>
            <Lock size={48} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>{t("loginRequired")}</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Veuillez vous connecter pour accéder à votre espace client.
          </p>
          <Link href="/auth/login" className="btn-primary" style={{ display: "inline-flex" }}>
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  const infoRows = [
    { icon: <User size={17} />, label: t("name"), value: user?.name },
    { icon: <Mail size={17} />, label: t("email"), value: user?.email },
    { icon: <Phone size={17} />, label: "Téléphone", value: user?.phone },
    { icon: <Shield size={17} />, label: "Rôle", value: user?.role === "admin" ? "Administrateur" : "Client" },
  ];

  return (
    <div className="container animate-fade-in-up" style={{ padding: "2rem 1.5rem 4rem", maxWidth: "720px" }}>
      {/* Welcome banner */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "16px",
            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-blue-light))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "1.5rem", color: "#fff", flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "1.625rem", fontWeight: 800, letterSpacing: "-0.025em" }}>
              {t("welcomeBack")}, {user?.name?.split(" ")[0]}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
              Votre espace personnel AutoShip DZ
            </p>
          </div>
        </div>
      </div>

      {/* Account information */}
      <div className="glass-card" style={{ padding: "1.75rem" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "1.5rem", fontSize: "1.125rem" }}>
          Informations du compte
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {infoRows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "1rem 0",
                borderBottom: i < infoRows.length - 1 ? "1px solid var(--border)" : "none",
              }}>
              <span style={{ color: "var(--accent-blue-light)", flexShrink: 0 }}>{row.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.125rem" }}>
                  {row.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                  {row.value || "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
