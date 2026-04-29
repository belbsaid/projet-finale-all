import { Router } from "express";
import {
  createLead,
  getLeads,
  getLead,
  getMyLeads,
  updateLeadStatus,
  assignCarToLead,
  deleteLead,
  createMeetingBooking,
  getBookedDates,
} from "../controllers/leadController.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  validateBodySchema,
  validateQuerySchema,
} from "../middleware/validations.js";
import {
  createLeadSchema,
  updateLeadStatusSchema,
  meetingBookingSchema,
  getLeadsQuerySchema,
} from "../validation/lead.js";
import { publicLimiter } from "../middleware/rateLimit.js";

const leadRouter = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
leadRouter.post(
  "/",
  publicLimiter,
  validateBodySchema(createLeadSchema),
  createLead,
);

// ─── Public — booked dates (for disabling already-picked slots) ──────────────
leadRouter.get("/booked-dates", getBookedDates);

// ─── Protected (meeting booking) ─────────────────────────────────────────────
leadRouter.post(
  "/meeting",
  protect,
  validateBodySchema(meetingBookingSchema),
  createMeetingBooking,
);

// ─── Protected (user's own leads) ────────────────────────────────────────────
leadRouter.get("/my-leads", protect, getMyLeads);

// ─── Admin only ───────────────────────────────────────────────────────────────
leadRouter.get(
  "/",
  protect,
  authorize("admin"),
  validateQuerySchema(getLeadsQuerySchema),
  getLeads,
);
leadRouter.get("/:id", protect, authorize("admin"), getLead);
leadRouter.put(
  "/:id/status",
  protect,
  authorize("admin"),
  validateBodySchema(updateLeadStatusSchema),
  updateLeadStatus,
);
leadRouter.put("/:id/car", protect, authorize("admin"), assignCarToLead);
leadRouter.delete("/:id", protect, authorize("admin"), deleteLead);

export default leadRouter;
