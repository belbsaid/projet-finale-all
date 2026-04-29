import { Router } from "express";
import {
  getCarModels,
  getCarModel,
  createCarModel,
  updateCarModel,
  deleteCarModel,
  getModelsByBrand,
  getModelYears,
} from "../controllers/carModelController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateBodySchema } from "../middleware/validations.js";
import {
  createCarModelSchema,
  updateCarModelSchema,
} from "../validation/carModel.js";

const carModelRouter = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
carModelRouter.get("/", getCarModels);
carModelRouter.get("/years", getModelYears);
carModelRouter.get("/brand/:brandId", getModelsByBrand);
carModelRouter.get("/:id", getCarModel);

// ─── Admin only ───────────────────────────────────────────────────────────────
carModelRouter.post(
  "/",
  protect,
  authorize("admin"),
  validateBodySchema(createCarModelSchema),
  createCarModel,
);
carModelRouter.put(
  "/:id",
  protect,
  authorize("admin"),
  validateBodySchema(updateCarModelSchema),
  updateCarModel,
);
carModelRouter.delete("/:id", protect, authorize("admin"), deleteCarModel);

export default carModelRouter;
