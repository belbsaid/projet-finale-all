"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  formatPrice,
  buildWhatsAppUrl,
  formatDate,
  STATUS_CONFIG,
} from "@/lib/utils";
import StatusBadge from "@/components/cars/StatusBadge";
import {
  Fuel, Cog, Gauge, Shield,
  MessageCircle, Phone, Mail,
  ScrollText, Wrench, Package,
  Calendar, CheckCircle, Check,
} from "lucide-react";

const WHATSAPP_NUM = "+213555123456";

interface Car {
  brand: { name: string } | string;
  model: { name: string } | string;
  category?: { name: string } | string;
  year?: number;
  color?: string;
  stockNumber?: string;
  status: string;
  finalPriceDZD?: number;
  sellingPriceDZD?: number;
  discountDZD?: number;
  mileage?: number;
  specs?: {
    engine?: string;
    transmission?: string;
    fuelType?: string;
    fuelConsumption?: string;
    warranty?: string;
  };
  features?: string[];
  expectedDeliveryDate?: string;
  arrivalDate?: string;
  statusHistory?: { status: string; date: string; note?: string }[];
}

interface CarDetailRightPanelProps {
  car: Car;
  carId: string;
  onOpenModal: () => void;
}

export default function CarDetailRightPanel({
  car,
  carId,
  onOpenModal,
}: CarDetailRightPanelProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "history">(
    "specs",
  );

  const brandName = typeof car.brand === "object" ? car.brand.name : "";
  const modelName = typeof car.model === "object" ? car.model.name : "";
  const categoryName =
    typeof car.category === "object" ? car.category?.name : "";
  const price = car.finalPriceDZD || car.sellingPriceDZD || 0;
  const hasDiscount = (car.discountDZD || 0) > 0;
  const whatsappMsg = `Bonjour, je suis intéressé par la ${brandName} ${modelName} ${car.year || ""} (Réf: ${car.stockNumber || ""}).`;

  void carId; // used by parent for modal

  const quickSpecs = [
    { icon: <Fuel size={16} />, label: car.specs?.fuelType || "—" },
    { icon: <Cog size={16} />, label: car.specs?.transmission || "—" },
    {
      icon: <Gauge size={16} />,
      label:
        car.mileage != null ? `${car.mileage.toLocaleString()} km` : "0 km",
    },
    { icon: <Shield size={16} />, label: car.specs?.warranty || "—" },
  ];

  const specRows = [
    { label: t("engine"), value: car.specs?.engine },
    { label: t("transmission"), value: car.specs?.transmission },
    { label: t("fuelType"), value: car.specs?.fuelType },
    { label: t("fuelConsumption"), value: car.specs?.fuelConsumption },
    { label: t("warranty"), value: car.specs?.warranty },
    { label: t("color"), value: car.color },
    { label: t("year"), value: car.year },
    ...(car.mileage != null
      ? [{ label: "Kilométrage", value: `${car.mileage.toLocaleString()} km` }]
      : []),
  ].filter((s) => s.value);

  const STATUS_ORDER = ["In Transit", "In Stock", "Reserved", "Sold"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* ── Title + Status ── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
            flexWrap: "wrap",
          }}>
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--accent-blue-light)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
            {brandName}
          </span>
          {categoryName && (
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
                padding: "0.125rem 0.5rem",
                background: "var(--bg-elevated)",
                borderRadius: "4px",
              }}>
              {categoryName}
            </span>
          )}
          <StatusBadge status={car.status || "In Stock"} size="md" />
        </div>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            marginBottom: "0.375rem",
          }}>
          {modelName} {car.year || ""}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          {car.color} · #{car.stockNumber}
        </p>
      </div>

      {/* ── Price ── */}
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}>
          <span
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "var(--accent-blue-light)",
            }}>
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <>
              <span
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-muted)",
                  textDecoration: "line-through",
                }}>
                {formatPrice(car.sellingPriceDZD || 0)}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(16,185,129,0.12)",
                  color: "var(--status-stock)",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "100px",
                  fontWeight: 600,
                }}>
                -{formatPrice(car.discountDZD || 0)}
              </span>
            </>
          )}
        </div>
        {car.expectedDeliveryDate && car.status === "In Transit" && (
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.8125rem",
              color: "var(--status-transit)",
              display: "flex", alignItems: "center", gap: "0.375rem",
            }}>
            <Calendar size={14} />
            {t("expectedDelivery")}: {formatDate(car.expectedDeliveryDate)}
          </p>
        )}
        {car.arrivalDate && (
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.8125rem",
              color: "var(--status-stock)",
              display: "flex", alignItems: "center", gap: "0.375rem",
            }}>
            <CheckCircle size={14} />
            {t("arrivalDate")}: {formatDate(car.arrivalDate)}
          </p>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: "flex", gap: "0.625rem" }}>
        <a
          href={buildWhatsAppUrl(WHATSAPP_NUM, whatsappMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
          style={{
            flex: 1,
            padding: "0.75rem 0.875rem",
            textAlign: "center",
            fontSize: "0.875rem",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
          }}>
          <MessageCircle size={15} /> WhatsApp
        </a>
        <a
          href="tel:+213555123456"
          className="btn-secondary"
          style={{
            padding: "0.75rem 0.875rem",
            textAlign: "center",
            fontSize: "0.875rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          <Phone size={15} />
        </a>
        <button
          onClick={onOpenModal}
          className="btn-primary"
          style={{ padding: "0.75rem 0.875rem", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={15} />
        </button>
      </div>

      {/* ── Quick specs ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "0.5rem",
        }}>
        {quickSpecs.map((spec, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "0.625rem 0.25rem",
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
            }}>
            <div style={{ color: "var(--accent-blue-light)", marginBottom: "0.25rem", display: "flex", justifyContent: "center" }}>{spec.icon}</div>
            <div
              style={{
                fontSize: "0.6250rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginTop: "0.125rem",
                lineHeight: 1.3,
              }}>
              {spec.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Trust badges ── */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          { icon: <ScrollText size={12} />, label: "Certificat COC" },
          { icon: <Wrench size={12} />, label: "Service Officiel" },
          { icon: <Package size={12} />, label: "Pièces Disponibles" },
        ].map((b, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              padding: "0.25rem 0.625rem",
              background: "var(--bg-elevated)",
              borderRadius: "100px",
              border: "1px solid var(--border)",
            }}>
            {b.icon} {b.label}
          </span>
        ))}
      </div>

      {/* ── Tabbed specs / features / history ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}>
        {/* Tab bar */}
        <div
          style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          {(
            [
              { id: "specs", label: t("specifications") },
              { id: "features", label: t("features") },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "0.75rem 0.25rem",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--accent-blue)"
                    : "2px solid transparent",
                color:
                  activeTab === tab.id
                    ? "var(--accent-blue-light)"
                    : "var(--text-muted)",
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "1rem", maxHeight: "260px", overflowY: "auto" }}>
          {activeTab === "specs" &&
            (specRows.length > 0 ? (
              <div>
                {specRows.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.4rem 0",
                      borderBottom:
                        i < specRows.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                    }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}>
                      {row.label}
                    </span>
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "1.5rem 0",
                  fontSize: "0.875rem",
                }}>
                Aucune spécification disponible.
              </p>
            ))}

          {activeTab === "features" &&
            (car.features && car.features.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.375rem",
                }}>
                {car.features.map((feat, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                    }}>
                    <Check
                      size={14}
                      style={{
                        color: "var(--status-stock)",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    />
                    {feat}
                  </div>
                ))}
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "1.5rem 0",
                  fontSize: "0.875rem",
                }}>
                Aucun équipement listé.
              </p>
            ))}

          {activeTab === "history" &&
            (car.statusHistory && car.statusHistory.length > 0 ? (
              <div>
                {/* Progress bar */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    marginBottom: "1.25rem",
                  }}>
                  {STATUS_ORDER.map((s, i) => {
                    const currentIdx = STATUS_ORDER.indexOf(car.status);
                    const isCompleted = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <div
                        key={s}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.375rem",
                        }}>
                        <div
                          style={{
                            height: 5,
                            width: "100%",
                            borderRadius: 3,
                            background: isCompleted
                              ? isCurrent
                                ? "var(--accent-blue)"
                                : "var(--status-stock)"
                              : "var(--bg-hover)",
                            transition: "all 0.5s",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.5625rem",
                            fontWeight: isCurrent ? 700 : 400,
                            color: isCompleted
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                            textAlign: "center",
                          }}>
                          {STATUS_CONFIG[s]?.label || s}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {car.statusHistory
                  .slice()
                  .reverse()
                  .map((entry, i) => (
                    <div
                      key={i}
                      className="timeline-step"
                      style={{
                        paddingBottom:
                          i < (car.statusHistory?.length ?? 0) - 1
                            ? "0.75rem"
                            : 0,
                      }}>
                      <div
                        className="timeline-dot"
                        style={{
                          background:
                            i === 0
                              ? "var(--accent-blue)"
                              : "var(--bg-elevated)",
                          border: "2px solid var(--border-strong)",
                          color: i === 0 ? "#fff" : "var(--text-muted)",
                          fontSize: "0.5rem",
                        }}>
                        {i === 0 ? "●" : "○"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                          {entry.status}
                        </div>
                        <div
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--text-muted)",
                          }}>
                          {formatDate(entry.date)}
                        </div>
                        {entry.note && (
                          <div
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--text-secondary)",
                              marginTop: "0.125rem",
                            }}>
                            {entry.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "1.5rem 0",
                  fontSize: "0.875rem",
                }}>
                Aucun historique de statut.
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
