"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { buildWhatsAppUrl } from "@/lib/utils";
import CarCard from "@/components/cars/CarCard";
import ContactForm from "@/components/contact/ContactForm";

const WHATSAPP_NUM = "+213555123456";

export default function HomeClient() {
  const { t } = useI18n();

  // Fetch featured cars (In Stock)
  const { data: carsData } = useQuery({
    queryKey: ["featured-cars"],
    queryFn: async () => {
      const res = await api.get("/cars", {
        params: { status: "In Stock", limit: "6" },
      });
      return res.data;
    },
  });

  // Fetch brands
  const { data: brandsRaw } = useQuery({
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

  const featuredCars = carsData?.cars || carsData?.data || [];
  const brands: {
    _id: string;
    name: string;
    logo?: string;
    description?: string;
    origin?: string;
  }[] = Array.isArray(brandsRaw) ? brandsRaw : [];

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/hero-car.png"
            alt="AutoShip DZ — Premium Chinese Cars"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
          />
          <div className="hero-overlay" />
        </div>

        <div
          className="container animate-fade-in-up"
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            paddingTop: "6rem",
            paddingBottom: "3rem",
          }}>
          {/* Pill badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 1rem",
              borderRadius: "100px",
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.25)",
              marginBottom: "1.5rem",
            }}>
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--accent-blue-light)",
              }}>
              🇩🇿 Importateur Agréé en Algérie
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: "1.5rem",
              color: "#fff",
            }}>
            AutoShip <span className="gradient-text">DZ</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.375rem)",
              color: "var(--text-secondary)",
              maxWidth: "560px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}>
            {t("heroDesc")}
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}>
            <a
              href={buildWhatsAppUrl(
                WHATSAPP_NUM,
                "Bonjour, je souhaite réserver une visite au showroom.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
              💬 {t("reserveVisit")}
            </a>
            <a
              href="#featured"
              className="btn-secondary"
              style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
              {t("discoverCars")} ↓
            </a>
          </div>

          {/* Brand logos strip */}
          {brands.length > 0 && (
            <div
              style={{
                marginTop: "5rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "2.5rem",
                flexWrap: "wrap",
                opacity: 0.5,
              }}>
              {brands.map((brand) => (
                <Link
                  key={brand._id}
                  href={`/brands/${brand.name.toLowerCase()}`}
                  style={{
                    transition: "opacity 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      style={{
                        height: 32,
                        width: "auto",
                        objectFit: "contain",
                        filter: "grayscale(100%) brightness(2)",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                      }}>
                      {brand.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ FEATURED CARS ═══ */}
      <section
        id="featured"
        className="section"
        style={{ background: "var(--bg-base)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="section-title">{t("featuredCars")}</h2>
            <p
              className="section-subtitle"
              style={{ margin: "0.75rem auto 0" }}>
              {t("featuredCarsSubtitle")}
            </p>
          </div>

          {featuredCars.length > 0 ? (
            <div className="car-grid stagger-children">
              {featuredCars.map((car: { _id: string }) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-muted)",
              }}>
              <p>Aucune voiture en stock pour le moment. Revenez bientôt !</p>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link
              href="/cars"
              className="btn-secondary"
              style={{ padding: "0.75rem 2rem" }}>
              {t("seeAll")} →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="section" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="section-title">{t("whyChooseUs")}</h2>
          </div>

          <div className="services-grid stagger-children">
            {[
              {
                icon: "🚢",
                title: t("officialImport"),
                desc: t("officialImportDesc"),
              },
              {
                icon: "🔧",
                title: t("officialService"),
                desc: t("officialServiceDesc"),
              },
              {
                icon: "📦",
                title: t("genuineParts"),
                desc: t("genuinePartsDesc"),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-white"
                style={{
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "16px",
                    background: "rgba(59,130,246,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    margin: "0 auto 1.25rem",
                  }}>
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--text-dark)",
                    marginBottom: "0.75rem",
                  }}>
                  {item.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-dark-secondary)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.7,
                  }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BRANDS SHOWCASE ═══ */}
      <section className="section" style={{ background: "var(--bg-base)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 className="section-title">{t("ourBrands")}</h2>
            <p
              className="section-subtitle"
              style={{ margin: "0.75rem auto 0" }}>
              {t("ourBrandsSubtitle")}
            </p>
          </div>

          <div className="brand-grid stagger-children">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                href={`/brands/${brand.name.toLowerCase()}`}
                className="glass-card"
                style={{
                  padding: "2rem 1.25rem",
                  textAlign: "center",
                  transition: "transform 0.3s, border-color 0.3s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "14px",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--accent-blue-light)",
                    overflow: "hidden",
                  }}>
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
                <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
                  {brand.name}
                </span>
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {brand.origin || "China"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT / CTA ═══ */}
      <section className="section" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "3rem",
              alignItems: "start",
            }}>
            {/* Left: info */}
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  fontWeight: 800,
                  marginBottom: "1rem",
                }}>
                {t("contactTitle")}
              </h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                  maxWidth: "500px",
                  margin: "0 auto 2rem",
                  lineHeight: 1.7,
                }}>
                {t("contactSubtitle")}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: "2rem",
                }}>
                <Link
                  href="/book-meeting"
                  className="btn-primary"
                  style={{ padding: "0.875rem 2rem" }}>
                  {t("bookMeeting")}
                </Link>
                <Link
                  href="/contact"
                  className="btn-secondary"
                  style={{ padding: "0.875rem 2rem" }}>
                  {t("contact")}
                </Link>
              </div>

              {/* Quick contact info */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "2rem",
                  flexWrap: "wrap",
                  color: "var(--text-muted)",
                  fontSize: "0.9375rem",
                }}>
                <span>📍 Alger, Algérie</span>
                <span>📱 +213 555 123 456</span>
                <span>📧 contact@autoship.dz</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
