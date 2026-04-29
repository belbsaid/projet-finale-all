import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateBodySchema } from "../middleware/validations.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validation/category.js";

const categoryRouter = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategory);

// ─── Admin only ───────────────────────────────────────────────────────────────
categoryRouter.post(
  "/",
  protect,
  authorize("admin"),
  validateBodySchema(createCategorySchema),
  createCategory,
);
categoryRouter.put(
  "/:id",
  protect,
  authorize("admin"),
  validateBodySchema(updateCategorySchema),
  updateCategory,
);
categoryRouter.delete("/:id", protect, authorize("admin"), deleteCategory);

export default categoryRouter;
