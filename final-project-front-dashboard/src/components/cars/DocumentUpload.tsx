"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, X, Loader2, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { carsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Doc {
  _id: string;
  name: string;
  url: string;
  size?: number;
  createdAt?: string;
}

interface DocumentUploadProps {
  carId: string;
  initialDocuments?: Doc[];
}

export function DocumentUpload({
  carId,
  initialDocuments = [],
}: DocumentUploadProps) {
  const [docs, setDocs] = useState<Doc[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const fd = new FormData();
      files.forEach((f) => fd.append("documents", f));
      setIsUploading(true);
      try {
        const res = await carsApi.uploadDocuments(carId, fd);
        const newDocs = res.data?.data?.documents || res.data?.documents || [];
        setDocs(newDocs);
        toast.success(`${files.length} document(s) uploaded`);
      } catch {
        toast.error("Failed to upload documents");
      } finally {
        setIsUploading(false);
      }
    },
    [carId],
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFiles(Array.from(files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (docId: string) => {
    try {
      await carsApi.deleteDocument(carId, docId);
      setDocs((prev) => prev.filter((d) => d._id !== docId));
      toast.success("Document removed");
    } catch {
      toast.error("Failed to remove document");
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="font-medium text-sm">
            {isUploading ? "Uploading..." : "Drop documents or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">PDF, DOC, XLS, images</p>
        </div>
      </div>

      {/* Document List */}
      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li
              key={doc._id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      formatSize(doc.size),
                      doc.createdAt && formatDate(doc.createdAt),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </a>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {docs.length === 0 && !isUploading && (
        <p className="text-xs text-muted-foreground text-center">
          No documents uploaded yet
        </p>
      )}
    </div>
  );
}
