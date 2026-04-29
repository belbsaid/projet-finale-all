import { Router } from "express";
import {
  getBrands,
  getPopularBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateBodySchema } from "../middleware/validations.js";
import { createBrandSchema, updateBrandSchema } from "../validation/brand.js";

const brandRouter = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
brandRouter.get("/", getBrands);
brandRouter.get("/popular", getPopularBrands);
brandRouter.get("/:id", getBrand);

// ─── Admin only ───────────────────────────────────────────────────────────────
brandRouter.post(
  "/",
  protect,
  authorize("admin"),
  validateBodySchema(createBrandSchema),
  createBrand,
);
brandRouter.put(
  "/:id",
  protect,
  authorize("admin"),
  validateBodySchema(updateBrandSchema),
  updateBrand,
);
brandRouter.delete("/:id", protect, authorize("admin"), deleteBrand);

export default brandRouter;
