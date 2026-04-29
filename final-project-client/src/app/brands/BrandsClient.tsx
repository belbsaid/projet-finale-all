"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function BrandsClient() {
  const { t } = useI18n();

  const { data: brandsRaw, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await api.get("/brands");
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.brands)) return payload.brands;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });
  const brands: {
    _id: string;
    name: string;
    logo?: string;
    description?: string;
    origin?: string;
    warrantyYears?: number;
    hasLocalServiceCenter?: boolean;
  }[] = Array.isArray(brandsRaw) ? brandsRaw : [];

  return (
    <div className="container" style={{ padding: "2rem 1.5rem 4rem" }}>
      <h1 className="section-title" style={{ marginBottom: "0.5rem" }}>
        {t("ourBrands")}
      </h1>
      <p className="section-subtitle" style={{ marginBottom: "2.5rem" }}>
        {t("ourBrandsSubtitle")}
      </p>

      {isLoading ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 220, borderRadius: "var(--radius-xl)" }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
          className="stagger-children"
        >
          {brands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand.name.toLowerCase()}`}
              className="card-white"
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "16px",
                  background: "#f0f4ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  color: "var(--accent-blue)",
                  marginBottom: "1.25rem",
                  overflow: "hidden",
                }}
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      padding: "8px",
                    }}
                  />
                ) : (
                  brand.name.slice(0, 2)
                )}
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  marginBottom: "0.375rem",
                }}
              >
                {brand.name}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-dark-secondary)",
                  marginBottom: "0.75rem",
                }}
              >
                {brand.origin || "China"}
              </p>
              {brand.description && (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                  }}
                >
                  {brand.description.length > 100
                    ? brand.description.slice(0, 100) + "…"
                    : brand.description}
                </p>
              )}
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  gap: "1rem",
                  fontSize: "0.8125rem",
                  color: "#6b7280",
                }}
              >
                {brand.warrantyYears && (
                  <span>🛡️ {brand.warrantyYears} ans</span>
                )}
                {brand.hasLocalServiceCenter && <span>🔧 Service local</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
