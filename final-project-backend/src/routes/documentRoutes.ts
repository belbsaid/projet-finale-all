import { Router } from "express";
import {
  uploadDocument,
  getDocumentsByCar,
  deleteDocument,
  getAllDocuments,
  getMyDocuments,
} from "../controllers/documentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";

const documentRouter = Router();

// ─── Customer / Protected ──────────────────────────────────────────────────
documentRouter.get("/my-documents", protect, getMyDocuments);

// ─── Admin only ───────────────────────────────────────────────────────────────

/**
 * POST /api/documents/upload
 * Multipart form: field "file" + body fields "carId" and "type".
 * Upload middleware runs BEFORE validation so we can access req.body.
 */
documentRouter.post(
  "/upload",
  protect,
  authorize("admin"),
  uploadSingle,
  uploadDocument,
);

documentRouter.get("/", protect, authorize("admin"), getAllDocuments);

documentRouter.get(
  "/car/:carId",
  protect,
  authorize("admin"),
  getDocumentsByCar,
);

documentRouter.delete("/:id", protect, authorize("admin"), deleteDocument);

export default documentRouter;
