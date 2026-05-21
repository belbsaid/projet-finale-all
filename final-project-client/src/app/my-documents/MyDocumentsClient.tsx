"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

const DOC_ICONS: Record<string, string> = {
  COC: "📋",
  invoice: "🧾",
  customs: "🏛️",
  bill_of_lading: "🚢",
};

const DOC_LABELS: Record<string, string> = {
  COC: "Certificat de Conformité",
  invoice: "Facture",
  customs: "Documents Douaniers",
  bill_of_lading: "Connaissement",
};

export default function MyDocumentsClient() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all my documents directly
  const { data: myDocumentsData, isLoading } = useQuery({
    queryKey: ["my-documents"],
    queryFn: async () => {
      const res = await api.get("/documents/my-documents");
      return res.data.documents || [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div
        className="container"
        style={{
          padding: "4rem 1.5rem",
          maxWidth: "500px",
          textAlign: "center",
        }}
      >
        <div className="glass-card" style={{ padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            {t("loginRequired")}
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {t("loginRequiredDesc")}
          </p>
          <Link
            href="/auth/login"
            className="btn-primary"
            style={{ display: "inline-flex" }}
          >
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  const rawDocs: any[] = myDocumentsData || [];

  const q = searchQuery.toLowerCase();

  const allDocuments = rawDocs
    .map((doc) => ({
      ...doc,
      carLabel: doc.car
        ? `${doc.car.brand?.name || ""} ${doc.car.model?.name || ""} ${doc.car.year ? doc.car.year : ""}`.trim()
        : "Véhicule",
    }))
    .filter((doc: any) => {
      if (!q) return true;
      const docName = (DOC_LABELS[doc.type] || doc.name || "").toLowerCase();
      const carName = (doc.carLabel || "").toLowerCase();
      return docName.includes(q) || carName.includes(q);
    });

  return (
    <div
      className="container animate-fade-in-up"
      style={{ padding: "2rem 1.5rem 4rem" }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h1 className="section-title" style={{ marginBottom: "0.25rem" }}>
            {t("myDocuments")}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Accédez à tous les documents relatifs à vos véhicules.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <span
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          >
            🔍
          </span>
          <input
            className="form-input"
            type="text"
            placeholder="Rechercher (document, véhicule...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: "2.5rem",
              width: "100%",
              borderRadius: "100px",
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 80, borderRadius: "var(--radius-md)" }}
            />
          ))}
        </div>
      ) : allDocuments.length > 0 ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {allDocuments.map((doc) => (
            <div
              key={doc._id}
              className="glass-card"
              style={{ padding: "1.25rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "2rem" }}>
                  {DOC_ICONS[doc.type] || "📄"}
                </span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                    {DOC_LABELS[doc.type] || doc.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {doc.carLabel} · {formatDate(doc.createdAt)}
                  </p>
                </div>
                <a
                  href={
                    doc.url.startsWith("http")
                      ? doc.url
                      : `${process.env.NEXT_PUBLIC_API_URL}${doc.url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.8125rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⬇ Télécharger
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{ padding: "3rem", textAlign: "center" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
          <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
            Aucun document disponible
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: "400px",
              margin: "0 auto 1.5rem",
            }}
          >
            Vos documents (COC, facture, garantie) apparaîtront ici une fois
            votre véhicule livré.
          </p>
          <Link
            href="/my-cars"
            className="btn-secondary"
            style={{ display: "inline-flex" }}
          >
            {t("myCars")}
          </Link>
        </div>
      )}
    </div>
  );
}
