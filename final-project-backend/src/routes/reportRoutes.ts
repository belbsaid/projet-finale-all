import { Router } from "express";
import {
  getStats,
  getMonthlyRevenue,
  getTopModels,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateQuerySchema } from "../middleware/validations.js";
import { revenueQuerySchema } from "../validation/report.js";

const reportRouter = Router();

// ─── Admin only ───────────────────────────────────────────────────────────────
reportRouter.get("/", protect, authorize("admin"), getStats);
reportRouter.get("/stats", protect, authorize("admin"), getStats);
reportRouter.get(
  "/revenue",
  protect,
  authorize("admin"),
  validateQuerySchema(revenueQuerySchema),
  getMonthlyRevenue,
);
reportRouter.get("/top-models", protect, authorize("admin"), getTopModels);

export default reportRouter;
