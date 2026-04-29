import { Router } from "express";
import { getActivities } from "../controllers/activityController.js";
import { protect, authorize } from "../middleware/auth.js";

const activityRouter = Router();

// Admin only — read the activity feed
activityRouter.get("/", protect, authorize("admin"), getActivities);

export default activityRouter;
