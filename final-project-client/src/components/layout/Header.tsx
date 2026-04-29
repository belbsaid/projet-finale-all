"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import {
  Globe,
  Share2,
  MessageCircle,
  Car,
  Search,
  Mail,
  FileText,
  LogOut,
  User,
} from "lucide-react";

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => setProfileOpen(false), [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/cars", label: t("cars") },
    { href: "/brands", label: t("brands") },
    { href: "/contact", label: t("contact") },
  ];

  const profileLinks = [
    { href: "/my-account", icon: <User size={15} />, label: t("myAccount") },
    { href: "/my-cars", icon: <Car size={15} />, label: t("myCars") },

    {
      href: "/my-documents",
      icon: <FileText size={15} />,
      label: t("myDocuments"),
    },
  ];

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? "rgba(10,10,15,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--border)"
            : "1px solid transparent",
          transition: "all 0.35s ease",
        }}>
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
          }}>
          {/* Logo */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: "var(--accent-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "0.75rem",
                color: "#fff",
                letterSpacing: "-0.02em",
              }}>
              AS
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.25rem",
                letterSpacing: "-0.025em",
              }}>
              Auto
              <span style={{ color: "var(--accent-blue-light)" }}>Ship</span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                  marginLeft: "4px",
                  fontWeight: 500,
                }}>
                DZ
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            style={{ display: "flex", alignItems: "center", gap: "2rem" }}
            className="hidden md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: pathname === link.href ? 600 : 400,
                  color:
                    pathname === link.href
                      ? "var(--accent-blue-light)"
                      : "var(--text-secondary)",
                  transition: "color 0.2s",
                  position: "relative",
                }}>
                {link.label}
                {pathname === link.href && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-4px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "20px",
                      height: "2px",
                      background: "var(--accent-blue)",
                      borderRadius: "1px",
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            className="hidden md:flex">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
              style={{
                padding: "0.375rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                transition: "all 0.2s",
                cursor: "pointer",
              }}>
              {lang === "fr" ? "FR" : "عربي"}
            </button>

            {isAuthenticated ? (
              <div ref={profileRef} style={{ position: "relative" }}>
                {/* Profile button */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "10px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "var(--accent-blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: "#fff",
                    }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  {user?.name?.split(" ")[0]}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                      marginLeft: "2px",
                      transition: "transform 0.2s",
                      transform: profileOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}>
                    <path
                      d="M2 4l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 220,
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      overflow: "hidden",
                      zIndex: 200,
                      animation: "fadeIn 0.15s ease",
                    }}>
                    {/* User info header */}
                    <div
                      style={{
                        padding: "0.875rem 1rem",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--bg-elevated)",
                      }}>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}>
                        {user?.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-muted)",
                          marginTop: "0.125rem",
                        }}>
                        {user?.email}
                      </div>
                    </div>

                    {/* Links */}
                    <div style={{ padding: "0.375rem" }}>
                      {profileLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.625rem",
                            padding: "0.5rem 0.625rem",
                            borderRadius: "6px",
                            fontSize: "0.8125rem",
                            color: "var(--text-secondary)",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }>
                          <span style={{ color: "var(--text-muted)" }}>
                            {link.icon}
                          </span>
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    {/* Divider + Logout */}
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        padding: "0.375rem",
                      }}>
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          padding: "0.5rem 0.625rem",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(239,68,68,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }>
                        <LogOut size={15} />
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary"
                style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                {t("login")}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              padding: "0.5rem",
              position: "relative",
              zIndex: 1001,
            }}
            aria-label="Menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* ── Slide-in Mobile Menu ── */}
      <div
        className={`slide-menu-overlay ${mobileOpen ? "open" : ""}`}
        onClick={closeMobile}
      />
      <div className={`slide-menu ${mobileOpen ? "open" : ""}`}>
        {/* Close button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "2rem",
          }}>
          <button
            onClick={closeMobile}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              padding: "0.5rem",
            }}
            aria-label="Close menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              style={{
                fontSize: "1.125rem",
                fontWeight: pathname === link.href ? 600 : 400,
                color:
                  pathname === link.href
                    ? "var(--accent-blue-light)"
                    : "var(--text-secondary)",
                padding: "0.875rem 0",
                borderBottom: "1px solid var(--border)",
                transition: "color 0.2s",
              }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--border)",
            margin: "1.5rem 0",
          }}
        />

        {isAuthenticated ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}>
            {profileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  color: "var(--text-secondary)",
                  fontSize: "1rem",
                  padding: "0.625rem 0",
                  borderBottom: "1px solid var(--border)",
                }}>
                <span style={{ color: "var(--text-muted)" }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                logout();
                closeMobile();
              }}
              style={{
                textAlign: "start",
                color: "#ef4444",
                background: "none",
                border: "none",
                fontSize: "1rem",
                padding: "0.625rem 0",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                cursor: "pointer",
              }}>
              <LogOut size={15} />
              {t("logout")}
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}>
            <Link
              href="/auth/login"
              onClick={closeMobile}
              className="btn-primary"
              style={{ textAlign: "center", padding: "0.75rem" }}>
              {t("login")}
            </Link>
            <Link
              href="/auth/register"
              onClick={closeMobile}
              className="btn-secondary"
              style={{ textAlign: "center", padding: "0.75rem" }}>
              {t("register")}
            </Link>
          </div>
        )}

        {/* Language toggle */}
        <div style={{ marginTop: "1.5rem" }}>
          <button
            onClick={() => {
              setLang(lang === "fr" ? "ar" : "fr");
              closeMobile();
            }}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              fontWeight: 600,
              transition: "all 0.2s",
              cursor: "pointer",
            }}>
            {lang === "fr" ? "عربي" : "Français"}
          </button>
        </div>

        {/* Social links */}
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            gap: "1.25rem",
            justifyContent: "center",
          }}>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
            <Share2 size={22} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
            <Globe size={22} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            style={{ color: "var(--text-muted)", transition: "color 0.2s" }}>
            <MessageCircle size={22} />
          </a>
        </div>
      </div>
    </>
  );
}
