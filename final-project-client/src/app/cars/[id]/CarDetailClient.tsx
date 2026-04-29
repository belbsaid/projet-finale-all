"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertCircle, ChevronLeft, Tag, MessageCircle, Phone, Mail } from "lucide-react";
import api from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { buildWhatsAppUrl } from "@/lib/utils";
import CarGallery from "@/components/cars/CarGallery";
import CarDetailRightPanel from "@/components/cars/CarDetailRightPanel";
import CarDetailModal from "@/components/cars/CarDetailModal";

const WHATSAPP_NUM = "+213555123456";

export default function CarDetailClient({ carId }: { carId: string }) {
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["car", carId],
    queryFn: async () => {
      const res = await api.get(`/cars/${carId}`);
      return res.data.car || res.data.data || res.data;
    },
  });

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="container" style={{ padding: "1.5rem 1.5rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
          <div className="skeleton" style={{ aspectRatio: "16/10", borderRadius: "var(--radius-lg)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="skeleton" style={{ height: 40, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton" style={{ height: 60, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton" style={{ height: 48, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-md)" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="container" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", color: "var(--text-muted)" }}>
          <AlertCircle size={48} />
        </div>
        <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Véhicule non trouvé</h2>
        <Link href="/cars" className="btn-secondary" style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <ChevronLeft size={16} /> {t("back")}
        </Link>
      </div>
    );
  }

  const car = data;

  // ── Sold / unavailable guard ──
  if (car.status === "Sold") {
    return (
      <div className="container" style={{ padding: "5rem 1.5rem", textAlign: "center", maxWidth: "520px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem", color: "var(--text-muted)" }}>
          <Tag size={48} />
        </div>
        <h1 style={{ fontWeight: 800, fontSize: "1.75rem", marginBottom: "0.75rem", letterSpacing: "-0.025em" }}>
          Véhicule vendu
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
          Ce véhicule n&apos;est plus disponible. Découvrez nos autres modèles en stock.
        </p>
        <Link href="/cars" className="btn-primary" style={{ display: "inline-flex" }}>
          Voir les véhicules disponibles
        </Link>
      </div>
    );
  }

  const brandName = typeof car.brand === "object" ? car.brand.name : "";
  const modelName = typeof car.model === "object" ? car.model.name : "";
  const carModel = `${brandName} ${modelName} ${car.year || ""}`.trim();
  const whatsappMsg = `Bonjour, je suis intéressé par la ${carModel} (Réf: ${car.stockNumber || ""}).`;

  return (
    <>
      <div className="container animate-fade-in-up" style={{ padding: "1.5rem 1.5rem 5rem" }}>

        {/* ── Breadcrumb ── */}
        <nav style={{
          display: "flex", gap: "0.5rem", fontSize: "0.8125rem",
          color: "var(--text-muted)", marginBottom: "1.25rem", flexWrap: "wrap",
        }}>
          <Link href="/" style={{ transition: "color 0.2s" }}>{t("home")}</Link>
          <span>›</span>
          <Link href="/cars" style={{ transition: "color 0.2s" }}>{t("cars")}</Link>
          <span>›</span>
          <span style={{ color: "var(--text-primary)" }}>{brandName} {modelName}</span>
        </nav>

        {/* ══════════════════════════════════════════
            MAIN 2-COLUMN LAYOUT
            LEFT:  sticky gallery
            RIGHT: info panel
            ══════════════════════════════════════════ */}
        <div className="car-detail-grid">
          {/* LEFT — Gallery (sticky) */}
          <div className="car-detail-gallery">
            <CarGallery
              photos={car.photos || []}
              alt={`${brandName} ${modelName}`}
            />
            {/* Customer notes below gallery */}
            {car.customerNotes && (
              <div style={{
                marginTop: "1rem", padding: "1rem",
                background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}>
                <h4 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  {t("carNotes")}
                </h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.875rem" }}>
                  {car.customerNotes}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — Info panel */}
          <div className="car-detail-info">
            <CarDetailRightPanel
              car={car}
              carId={carId}
              onOpenModal={() => setModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile sticky action bar ── */}
      <div className="car-detail-mobile-bar">
        <a
          href={buildWhatsAppUrl(WHATSAPP_NUM, whatsappMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
          style={{ flex: "1 1 55%", padding: "0.75rem", textAlign: "center", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a href="tel:+213555123456" className="btn-secondary" style={{
          flex: "1 1 20%", padding: "0.75rem", textAlign: "center", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Phone size={16} />
        </a>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
          style={{ flex: "1 1 25%", padding: "0.75rem", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}
        >
          <Mail size={16} /> Contact
        </button>
      </div>

      {/* ── Contact modal ── */}
      <CarDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        carModel={carModel}
        carId={carId}
      />
    </>
  );
}
