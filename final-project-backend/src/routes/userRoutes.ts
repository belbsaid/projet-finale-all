import { Router } from "express";
import { getUsers, getUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const userRouter = Router();

// ─── Admin only ───────────────────────────────────────────────────────────────
userRouter.get("/", protect, authorize("admin"), getUsers);
userRouter.get("/:id", protect, authorize("admin"), getUser);

export default userRouter;
