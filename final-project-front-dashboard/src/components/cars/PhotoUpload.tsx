"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { carsApi } from "@/lib/api";

interface PhotoUploadProps {
  carId?: string; // Optional for new cars
  initialPhotos?: string[];
  onFilesChange?: (files: File[]) => void;
}

export function PhotoUpload({
  carId,
  initialPhotos = [],
  onFilesChange,
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine remote photos and local pending files for display
  const allDisplayPhotos = [
    ...photos.map((url) => ({
      _id: url,
      url,
      isPending: false,
    })),
    ...pendingFiles.map((f, i) => ({
      _id: `pending-${i}-${f.name}`,
      url: URL.createObjectURL(f),
      isPending: true,
      file: f,
    })),
  ];

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!carId) {
        // Offline mode: queue files
        setPendingFiles((prev) => {
          const updated = [...prev, ...files];
          // We use a microtask (Promise.resolve) to call onFilesChange outside of the render phase
          // which React uses to evaluate functional updaters.
          Promise.resolve().then(() => onFilesChange?.(updated));
          return updated;
        });
        return;
      }

      // Online mode: upload immediately
      const fd = new FormData();
      files.forEach((f) => fd.append("photos", f));
      setIsUploading(true);
      try {
        const res = await carsApi.uploadPhotos(carId, fd);
        const newPhotos = res.data?.data?.photos || res.data?.photos || [];
        setPhotos(newPhotos);
        toast.success(`${files.length} photo(s) uploaded`);
      } catch {
        toast.error("Failed to upload photos");
      } finally {
        setIsUploading(false);
      }
    },
    [carId, onFilesChange],
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) {
      toast.error("Please select image files only");
      return;
    }
    uploadFiles(valid);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (photoObj: {
    _id: string;
    isPending?: boolean;
    file?: File;
  }) => {
    if (photoObj.isPending) {
      // Remove from pending files
      setPendingFiles((prev) => {
        const updated = prev.filter((f) => f !== photoObj.file);
        Promise.resolve().then(() => onFilesChange?.(updated));
        return updated;
      });
      return;
    }

    if (!carId) return;

    try {
      const filename = photoObj._id.split("/").pop();
      if (!filename) return;
      await carsApi.deletePhoto(carId, filename);
      setPhotos((prev) => prev.filter((p) => p !== photoObj._id));
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-accent/30"
        }`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <Camera className="h-10 w-10 text-muted-foreground" />
          )}
          <p className="font-medium text-sm">
            {isUploading
              ? "Uploading..."
              : "Drop photos here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP up to 10MB each
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {allDisplayPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allDisplayPhotos.map((photo) => (
            <div
              key={photo._id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={
                  photo.url.startsWith("http") || photo.url.startsWith("blob")
                    ? photo.url
                    : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace("/api", "")}${photo.url}`
                }
                alt="Car photo"
                className="object-cover w-full h-full absolute inset-0"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo);
                  }}
                  className="p-1.5 rounded-full bg-destructive text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <div
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {allDisplayPhotos.length} photo(s) selected
      </p>
    </div>
  );
}
