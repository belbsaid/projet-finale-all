"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

const schema = z.object({
  name: z.string().trim().min(1, "Le nom est requis"),
  phone: z
    .string()
    .trim()
    .regex(/^\+213[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/, "Format: +213 XXX XX XX XX"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  message: z.string().trim().optional(),
});

type FormData = z.infer<typeof schema>;

interface CarDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  carModel: string;
  carId: string;
}

export default function CarDetailModal({
  isOpen,
  onClose,
  carModel,
  carId,
}: CarDetailModalProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const firstInputId = "car-modal-name-input";
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "+213 ",
      email: user?.email || "",
      message: `Bonjour, je suis intéressé par : ${carModel}.`,
    },
  });

  // Focus trap & ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const el = document.getElementById(firstInputId) as HTMLInputElement | null;
      el?.focus();
    }, 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.post("/leads", {
        ...data,
        email: data.email || undefined,
        interestedModel: carModel,
        carId,
        source: "Website Form",
      });
      toast.success("Demande envoyée ! Nous vous contacterons sous 24h.");
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="car-modal-overlay"
        style={{ pointerEvents: isOpen ? "auto" : "none", opacity: isOpen ? 1 : 0 }}
        aria-hidden={!isOpen}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Formulaire de contact"
        className="car-modal-panel"
        style={{
          transform: isOpen
            ? "translate(-50%, -50%) translateY(0)"
            : "translate(-50%, -50%) translateY(40px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.5rem 1.5rem 0",
        }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>
              Nous contacter
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {carModel} · Réponse sous 24h
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", margin: "1.25rem 0" }} />

        {/* Body */}
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", color: "var(--status-stock)" }}>
                <CheckCircle size={48} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Demande envoyée !</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
                Notre équipe vous contactera très prochainement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">{t("name")} *</label>
                  <input
                    id={firstInputId}
                    className="form-input"
                    type="text"
                    placeholder="Votre nom"
                    {...register("name")}
                  />
                  {errors.name && <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {errors.name.message}</p>}
                </div>
                <div>
                  <label className="form-label">{t("phone")} *</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="+213 555 12 34 56"
                    {...register("phone")}
                  />
                  {errors.phone && <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">{t("email")}</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="votre@email.com"
                  {...register("email")}
                />
                {errors.email && <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {errors.email.message}</p>}
              </div>

              <div>
                <label className="form-label">{t("message")}</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Message optionnel..."
                  {...register("message")}
                  style={{ resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: "100%", padding: "0.875rem", opacity: isSubmitting ? 0.7 : 1, marginTop: "0.25rem" }}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
