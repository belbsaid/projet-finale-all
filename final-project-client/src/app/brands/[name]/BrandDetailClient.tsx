"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function BrandDetailClient({
  brandName,
}: {
  brandName: string;
}) {
  const { t } = useI18n();

  const { data: brand, isLoading: brandLoading, error: brandError } = useQuery({
    queryKey: ["brand-by-name", brandName],
    queryFn: async () => {
      const res = await api.get('/brands');
      const payload = res.data;
      let allBrands: any[] = [];
      if (Array.isArray(payload)) allBrands = payload;
      else if (Array.isArray(payload?.brands)) allBrands = payload.brands;
      else if (Array.isArray(payload?.data)) allBrands = payload.data;

      const found = allBrands.find(
        (b: any) => b.name.toLowerCase() === brandName.toLowerCase()
      );
      if (!found) throw new Error('Brand not found');
      return found;
    },
  });

  const { data: carsRaw, isLoading: carsLoading } = useQuery({
    queryKey: ["cars-by-brand", brand?._id],
    enabled: !!brand?._id,
    queryFn: async () => {
      const res = await api.get(`/cars`, {
        params: { brand: brand._id, status: "In Stock", limit: 50 },
      });
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.cars)) return payload.cars;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });
  const cars: any[] = Array.isArray(carsRaw) ? carsRaw : [];

  if (brandLoading) {
    return (
      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        <div
          className="skeleton"
          style={{
            height: 200,
            borderRadius: "var(--radius-lg)",
            marginBottom: "2rem",
          }}
        />
      </div>
    );
  }

  if (brandError || !brand) {
    return (
      <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</p>
        <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Marque introuvable</h2>
        <Link href="/brands" style={{ marginTop: "1rem", display: "inline-flex" }}>← Retour aux marques</Link>
      </div>
    );
  }


  return (
    <div
      className="container animate-fade-in-up"
      style={{ padding: "2rem 1.5rem 4rem" }}>
      {/* Breadcrumb */}
      <nav
        style={{
          display: "flex",
          gap: "0.5rem",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          marginBottom: "1.5rem",
        }}>
        <Link href="/">{t("home")}</Link>
        <span>/</span>
        <Link href="/brands">{t("brands")}</Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{brand?.name}</span>
      </nav>

      {/* Brand header */}
      <div
        className="glass-card"
        style={{ padding: "2rem", marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
            flexWrap: "wrap",
          }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, var(--bg-elevated), var(--bg-hover))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 900,
              color: "var(--brand-red-light)",
              overflow: "hidden",
            }}>
            {brand?.logo ? (
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "10px",
                }}
              />
            ) : (
              brand?.name?.slice(0, 2)
            )}
          </div>
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                letterSpacing: "-0.025em",
              }}>
              {brand?.name}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              {brand?.origin || "China"} · {brand?.warrantyYears || 3} ans de
              garantie
            </p>
          </div>
        </div>
        {brand?.description && (
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: "1.25rem",
              lineHeight: 1.7,
              maxWidth: "700px",
            }}>
            {brand.description}
          </p>
        )}
      </div>

      {/* Cars grid */}
      <h2
        style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Véhicules {brand?.name} disponibles
      </h2>

      {carsLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 280, borderRadius: "var(--radius-lg)" }}
            />
          ))}
        </div>
      ) : cars.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
          className="stagger-children">
          {cars.map((car: any) => {
            const modelName =
              typeof car.model === "object" ? car.model?.name : "";
            const photo =
              car.photos && car.photos.length > 0 ? car.photos[0] : null;
            const price = car.finalPriceDZD || car.priceDZD || 0;

            return (
              <Link
                key={car._id || car.id}
                href={`/cars/${car._id || car.id}`}
                className="glass-card"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}>
                {/* Car image */}
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}>
                  {photo ? (
                    <img
                      src={photo}
                      alt={`${brand.name} ${modelName}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "3rem",
                        color: "var(--text-muted)",
                        opacity: 0.4,
                      }}>
                      🚗
                    </span>
                  )}
                </div>

                {/* Car info */}
                <div style={{ padding: "1.25rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}>
                    {brand.name} {modelName}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}>
                    {car.color && <span>🎨 {car.color}</span>}
                    {car.year && <span>📅 {car.year}</span>}
                    {typeof car.category === "object" &&
                      car.category?.name && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {car.category.name}
                        </span>
                      )}
                  </div>

                  {price > 0 && (
                    <p
                      style={{
                        marginTop: "0.75rem",
                        fontWeight: 700,
                        fontSize: "1.0625rem",
                        color: "var(--brand-red-light)",
                      }}>
                      {price.toLocaleString()} DZD
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
          }}>
          <p>Aucun véhicule disponible pour cette marque.</p>
        </div>
      )}
    </div>
  );
}
