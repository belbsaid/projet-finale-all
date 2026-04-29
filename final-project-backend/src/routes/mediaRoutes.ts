import { Router } from "express";
import {
  fetchPhotos,
  uploadPhoto,
  deletePhoto,
} from "../controllers/mediaController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Route to fetch photos
router.get("/", fetchPhotos);

// Route to upload a photo
router.post("/upload", upload.single("image"), uploadPhoto);

// Route to delete a photo
router.delete("/", deletePhoto);

export default router;
