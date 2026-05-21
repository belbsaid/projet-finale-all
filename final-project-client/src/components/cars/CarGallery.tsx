"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { buildImageUrl } from "@/lib/utils";

interface CarGalleryProps {
  photos: string[];
  alt: string;
}

const NAV_BTN: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background 0.2s, transform 0.2s",
  zIndex: 2,
  userSelect: "none",
};

export default function CarGallery({ photos, alt }: CarGalleryProps) {
  const [selected, setSelected] = useState(0);
  const touchStartX = useRef(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  if (!photos || photos.length === 0) {
    return (
      <div
        style={{
          aspectRatio: "16/10",
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "4rem",
        }}
      >
        🚗
      </div>
    );
  }

  const goTo = (index: number) => {
    const next = (index + photos.length) % photos.length;
    setSelected(next);
    // Scroll the thumbnail strip to keep the active thumb visible
    const strip = thumbStripRef.current;
    if (strip) {
      const thumb = strip.children[next] as HTMLElement | undefined;
      thumb?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const goPrev = () => goTo(selected - 1);
  const goNext = () => goTo(selected + 1);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  return (
    <div>
      {/* ── Main image ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          aspectRatio: "16/10",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--bg-elevated)",
          marginBottom: "0.75rem",
          touchAction: "pan-y",
        }}
      >
        <Image
          src={buildImageUrl(photos[selected])}
          alt={`${alt} - Photo ${selected + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          style={{ objectFit: "cover", transition: "opacity 0.25s ease" }}
          loading="eager"
          unoptimized={buildImageUrl(photos[selected]).startsWith(
            process.env.NEXT_PUBLIC_UPLOADS_URL as string,
          )}
        />

        {/* Counter pill */}
        <div
          style={{
            position: "absolute",
            bottom: "0.75rem",
            right: "0.75rem",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            padding: "0.25rem 0.75rem",
            borderRadius: "100px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          {selected + 1} / {photos.length}
        </div>

        {/* Prev / Next arrows — always visible when >1 photo */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Photo précédente"
              style={{ ...NAV_BTN, left: "0.75rem" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.55)")
              }
            >
              ‹
            </button>
            <button
              onClick={goNext}
              aria-label="Photo suivante"
              style={{ ...NAV_BTN, right: "0.75rem" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.55)")
              }
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {photos.length > 1 && (
        <div
          ref={thumbStripRef}
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.375rem",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
          }}
        >
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Voir photo ${i + 1}`}
              style={{
                position: "relative",
                flex: "0 0 72px",
                height: "52px",
                borderRadius: "10px",
                overflow: "hidden",
                border:
                  i === selected
                    ? "2px solid var(--accent-blue)"
                    : "2px solid transparent",
                opacity: i === selected ? 1 : 0.5,
                transition: "opacity 0.2s, border-color 0.2s, transform 0.2s",
                cursor: "pointer",
                background: "none",
                padding: 0,
                scrollSnapAlign: "start",
                transform: i === selected ? "scale(1.05)" : "scale(1)",
              }}
            >
              <Image
                src={buildImageUrl(photo)}
                alt={`${alt} miniature ${i + 1}`}
                fill
                sizes="72px"
                style={{ objectFit: "cover" }}
                unoptimized={buildImageUrl(photo).startsWith(
                  process.env.NEXT_PUBLIC_UPLOADS_URL as string,
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
