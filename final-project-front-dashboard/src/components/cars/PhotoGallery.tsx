"use client";

import { useState } from "react";
import { Car as CarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoGalleryProps {
  photos: (string | { _id?: string; url: string })[];
  alt?: string;
}

export function PhotoGallery({ photos, alt = "Car" }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const backendBaseUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
  ).replace("/api", "");

  const getUrl = (photo: string | { url: string }) => {
    const raw = typeof photo === "string" ? photo : photo.url;
    return raw.startsWith("http") ? raw : `${backendBaseUrl}${raw}`;
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="text-center">
          <CarIcon className="h-12 w-12 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video group">
        <img
          src={getUrl(photos[activeIndex])}
          alt={`${alt} - Photo ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === 0 ? photos.length - 1 : prev - 1,
                )
              }>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === photos.length - 1 ? 0 : prev + 1,
                )
              }>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
              {activeIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-indigo-500 ring-1 ring-indigo-500/30"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}>
              <img
                src={getUrl(photo)}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
