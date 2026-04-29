import { Router } from "express";
import {
  getCars,
  getCar,
  getCarByVinPublic,
  getCarStatusByVin,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
  getCarsByStatus,
  getCarStats,
  uploadCarPhotos,
  deleteCarPhoto,
  getCarsForStaticGeneration,
  getCustomerCars,
} from "../controllers/carController.js";
import { protect, authorize, optionalAuth } from "../middleware/auth.js";
import {
  validateBodySchema,
  validateQuerySchema,
} from "../middleware/validations.js";
import {
  createCarSchema,
  updateCarSchema,
  updateCarStatusSchema,
  getCarsQuerySchema,
} from "../validation/car.js";
import { upload } from "../middleware/uploadMiddleware.js";

const carRouter = Router();

// ─── Public (landing page) ────────────────────────────────────────────────────
carRouter.get(
  "/",
  validateQuerySchema(getCarsQuerySchema),
  optionalAuth,
  getCars,
);
carRouter.get("/static", getCarsForStaticGeneration);
carRouter.get("/vin/public/:vin", getCarByVinPublic);

// ─── Protected VIN lookup (customer-scoped) ───────────────────────────────────
carRouter.get("/vin/:vin", protect, getCarStatusByVin);

// ─── Protected customer dashboard ─────────────────────────────────────────────
carRouter.get("/customer/my-cars", protect, getCustomerCars);

// ─── Admin only ───────────────────────────────────────────────────────────────
// NOTE: static paths MUST come before /:id to avoid route shadowing.
carRouter.get("/stats/overview", protect, authorize("admin"), getCarStats);
carRouter.get("/status/:status", protect, authorize("admin"), getCarsByStatus);

// Dynamic param routes AFTER all static paths
carRouter.get("/:id", getCar);

carRouter.post(
  "/",
  protect,
  authorize("admin"),
  validateBodySchema(createCarSchema),
  createCar,
);
carRouter.put(
  "/:id",
  protect,
  authorize("admin"),
  validateBodySchema(updateCarSchema),
  updateCar,
);
carRouter.put(
  "/:id/status",
  protect,
  authorize("admin"),
  validateBodySchema(updateCarStatusSchema),
  updateCarStatus,
);

// Photo management
carRouter.post(
  "/:id/photos",
  protect,
  authorize("admin"),
  upload.array("photos", 10),
  uploadCarPhotos,
);
carRouter.delete("/:id/photos", protect, authorize("admin"), deleteCarPhoto);

carRouter.delete("/:id", protect, authorize("admin"), deleteCar);

export default carRouter;
