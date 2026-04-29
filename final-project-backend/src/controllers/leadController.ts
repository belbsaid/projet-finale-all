import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger.js";
import { StatusCodes } from "http-status-codes";
import LeadModel from "../models/Lead.js";
import CarModel from "../models/Car.js";
import type { AuthenticatedRequest } from "../types/express.js";
import {
  getPaginationOptions,
  buildPaginationMeta,
} from "../utils/pagination.js";

/**
 * GET /api/leads/my-leads
 * Protected — returns leads submitted by the authenticated user.
 */
export async function getMyLeads(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const userEmail = authReq.user.email;
    const userPhone = authReq.user.phone;

    // Match by submittedBy OR email OR phone (covers public form submissions)
    const query = {
      $or: [
        { submittedBy: userId },
        ...(userEmail ? [{ email: userEmail }] : []),
        ...(userPhone ? [{ phone: userPhone }] : []),
      ],
    };

    const leads = await LeadModel.find(query)
      .populate({
        path: "carId",
        select: "stockNumber photos brand model year color status finalPriceDZD sellingPriceDZD",
        populate: [
          { path: "brand", select: "name" },
          { path: "model", select: "name" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ success: true, leads });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * GET /api/leads
 * Admin only — list leads with optional filters.
 * Supports pagination: ?page=1&limit=10
 */
export async function getLeads(req: Request, res: Response): Promise<void> {
  try {
    const { status, since, carId, submittedBy, email, phone, forUser, forUserEmail, forUserPhone } = req.query;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (carId) query.carId = carId;
    if (email) query.email = email;
    if (phone) query.phone = phone;

    // forUser: compound lookup — match leads by submittedBy OR email OR phone
    // Used by the user detail page to find all leads for a given user
    if (forUser || forUserEmail || forUserPhone) {
      const orConditions: Record<string, unknown>[] = [];
      if (forUser) orConditions.push({ submittedBy: forUser });
      if (forUserEmail) orConditions.push({ email: { $regex: new RegExp(`^${String(forUserEmail).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });
      if (forUserPhone) orConditions.push({ phone: forUserPhone });
      if (orConditions.length > 0) query.$or = orConditions;
    } else if (submittedBy) {
      query.submittedBy = submittedBy;
    }

    if (since) {
      const days = Number(since);
      if (!Number.isNaN(days)) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        query.createdAt = { $gte: date };
      }
    }

    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await LeadModel.countDocuments(query);
    const leads = await LeadModel.find(query)
      .populate("submittedBy", "name email")
      .populate({
        path: "carId",
        select: "stockNumber photos brand model year color",
        populate: [
          { path: "brand", select: "name" },
          { path: "model", select: "name" },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      leads,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * GET /api/leads/:id
 * Admin only — single lead by ID.
 */
export async function getLead(req: Request, res: Response): Promise<void> {
  try {
    const lead = await LeadModel.findById(req.params.id)
      .populate("submittedBy", "name email")
      .populate({
        path: "carId",
        select: "stockNumber photos brand model year color",
        populate: [
          { path: "brand", select: "name" },
          { path: "model", select: "name" },
        ],
      });

    if (!lead) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Lead not found" },
      });
      return;
    }
    res.status(StatusCodes.OK).json({ success: true, lead });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * POST /api/leads
 * Public — create a lead (landing page contact / inquiry form).
 * If authenticated, links the lead to the submitting user.
 */
export async function createLead(req: Request, res: Response): Promise<void> {
  try {
    // Safely check if user is authenticated (route is public, so req.user may not exist)
    const submittedBy = (req as AuthenticatedRequest).user?.id ?? null;

    // Global double-booking check — if reservationDate + reservationTimeSlot are provided
    if (req.body.reservationDate && req.body.reservationTimeSlot) {
      const dateStart = new Date(req.body.reservationDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);

      const conflict = await LeadModel.findOne({
        reservationDate: { $gte: dateStart, $lt: dateEnd },
        reservationTimeSlot: req.body.reservationTimeSlot,
        status: { $nin: ["Lost"] }, // Ignore cancelled reservations
      });

      if (conflict) {
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          error: {
            message: `This time slot is already booked for ${dateStart.toISOString().split("T")[0]}. Please choose another date or time slot.`,
          },
        });
        return;
      }
    }

    const leadData = {
      ...req.body,
      submittedBy,
      reservationDate: req.body.reservationDate
        ? new Date(req.body.reservationDate)
        : null,
      reservationTimeSlot: req.body.reservationTimeSlot || null,
      statusHistory: [
        {
          status: req.body.status || "New",
          date: new Date(),
          changedBy: submittedBy,
          note: "Initial creation",
        },
      ],
    };

    const lead = await LeadModel.create(leadData);

    logActivity({
      type: "lead_created",
      title: `New reservation: ${lead.name}`,
      description: `Interested in ${lead.interestedModel || "—"} · Source: ${lead.source || "direct"}`,
      entityId: lead._id as any,
      entityType: "lead",
      performedBy: submittedBy ?? undefined,
    });

    res.status(StatusCodes.CREATED).json({ success: true, lead });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * Allowed lead status transitions (workflow rules).
 * Key = current status, Value = array of allowed next statuses.
 */
const LEAD_TRANSITIONS: Record<string, string[]> = {
  New: ["Contacted"],
  Contacted: ["Visited Store", "Sold", "Lost"],
  "Visited Store": ["Sold", "Lost"],
  Sold: [],   // terminal
  Lost: [],   // terminal
};

/**
 * Mapping: when a lead reaches a certain status, what should the linked car become?
 */
const LEAD_TO_CAR_STATUS: Record<string, string> = {
  Contacted: "Reserved",
  Sold: "Sold",
  Lost: "In Stock",
};

/**
 * PUT /api/leads/:id/status
 * Admin only — update the status of a lead.
 * Enforces workflow transition rules and auto-syncs linked car status.
 */
export async function updateLeadStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { status, carId } = req.body as { status: string; carId?: string };
    const authReq = req as AuthenticatedRequest;

    const lead = await LeadModel.findById(req.params.id);
    if (!lead) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Lead not found" },
      });
      return;
    }

    const oldStatus = lead.status;

    // ── Workflow validation ──────────────────────────────────────────────
    const allowed = LEAD_TRANSITIONS[oldStatus] || [];
    if (!allowed.includes(status)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          message: `Cannot transition from "${oldStatus}" to "${status}". Allowed: ${allowed.length > 0 ? allowed.join(", ") : "none (terminal state)"}`,
        },
      });
      return;
    }

    // ── Update lead status ───────────────────────────────────────────────
    if (status === "Sold" && carId) {
      lead.carId = carId as unknown as import("mongoose").Types.ObjectId;
    }
    lead.status = status as import("../types/models/lead.js").LeadStatus;

    lead.statusHistory.push({
      status: lead.status,
      date: new Date(),
      changedBy: authReq.user.id as unknown as import("mongoose").Types.ObjectId,
    });

    await lead.save();

    // ── Auto-sync linked car status ──────────────────────────────────────
    const targetCarStatus = LEAD_TO_CAR_STATUS[status];
    const linkedCarId = carId || (lead.carId ? String(lead.carId) : null);

    if (targetCarStatus && linkedCarId) {
      const car = await CarModel.findById(linkedCarId);
      if (car) {
        const oldCarStatus = car.status;
        car.status = targetCarStatus as typeof car.status;

        // Auto-set dates
        if (targetCarStatus === "Sold") {
          car.soldDate = new Date();
          car.customerId = lead.submittedBy as unknown as import("mongoose").Types.ObjectId;
        }
        if (targetCarStatus === "In Stock" && oldCarStatus !== "In Stock") {
          car.arrivalDate = car.arrivalDate || new Date();
          car.soldDate = null;
          car.customerId = null;
        }

        car.statusHistory.push({
          status: targetCarStatus,
          date: new Date(),
          changedBy: authReq.user.id as unknown as import("mongoose").Types.ObjectId,
          note: `Auto-updated from lead "${lead.name}" → ${status}`,
        });

        await car.save();

        logActivity({
          type: "car_status_changed",
          title: `Car auto-updated → ${targetCarStatus}`,
          description: `Triggered by lead "${lead.name}" moving to ${status}`,
          entityId: car._id as any,
          entityType: "car",
          performedBy: authReq.user.id,
        });
      }
    }

    const updatedLead = await LeadModel.findById(req.params.id)
      .populate("submittedBy", "name email")
      .populate({
        path: "carId",
        select: "stockNumber photos brand model year color status",
        populate: [
          { path: "brand", select: "name" },
          { path: "model", select: "name" },
        ],
      });

    logActivity({
      type: "lead_status_changed",
      title: `Reservation ${lead.name} → ${status}`,
      description: `Previous: ${oldStatus}`,
      entityId: lead._id as any,
      entityType: "lead",
      performedBy: authReq.user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Lead status updated to "${status}"`,
      lead: updatedLead,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * POST /api/leads/meeting
 * Protected — create a meeting booking lead.
 * Generates calendar (ICS) event hints and WhatsApp deep link.
 * Enforces GLOBAL double-booking: only one reservation allowed per date+slot.
 */
export async function createMeetingBooking(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { carId, preferredDate, preferredTimeSlot, notes } = req.body as {
      carId: string;
      preferredDate: string;
      preferredTimeSlot: "morning" | "afternoon" | "evening";
      notes?: string;
    };

    // ── Global double-booking check ──────────────────────────────────────
    const dateStart = new Date(preferredDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const conflict = await LeadModel.findOne({
      reservationDate: { $gte: dateStart, $lt: dateEnd },
      reservationTimeSlot: preferredTimeSlot,
      status: { $nin: ["Lost"] },
    });

    if (conflict) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        error: {
          message: `This time slot (${preferredTimeSlot}) is already booked for ${dateStart.toISOString().split("T")[0]}. Please choose another date or time slot.`,
        },
      });
      return;
    }

    // Look up the car to get model name
    const car = await CarModel.findById(carId)
      .populate("brand", "name")
      .populate("model", "name year");

    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }

    // Build interestedModel string from brand + model
    const brandName =
      (car.brand as unknown as { name: string })?.name ?? "Unknown";
    const modelName =
      (car.model as unknown as { name: string; year: number })?.name ??
      "Unknown";
    const modelYear = (car.model as unknown as { year: number })?.year ?? "";
    const interestedModel = `${brandName} ${modelName} ${modelYear}`.trim();

    // Map time slot to hours
    const timeSlotMap = {
      morning: { start: "09:00", end: "12:00" },
      afternoon: { start: "13:00", end: "17:00" },
      evening: { start: "17:00", end: "20:00" },
    };
    const slot = timeSlotMap[preferredTimeSlot];

    // Create the lead with reservation date fields
    const lead = await LeadModel.create({
      name: authReq.user.name,
      phone: authReq.user.phone,
      email: authReq.user.email,
      message: notes ?? "",
      interestedModel,
      carId,
      source: "Meeting Booking",
      submittedBy: authReq.user.id,
      reservationDate: dateStart,
      reservationTimeSlot: preferredTimeSlot,
      statusHistory: [
        {
          status: "New",
          date: new Date(),
          changedBy: authReq.user.id as unknown as import("mongoose").Types.ObjectId,
          note: "Meeting booked",
        },
      ],
    });

    // Build calendar event data (ICS-compatible)
    const dateStr = preferredDate.split("T")[0].replace(/-/g, "");
    const calendarEvent = {
      summary: `AutoShip DZ — Meeting: ${interestedModel}`,
      dtstart: `${dateStr}T${slot.start.replace(":", "")}00`,
      dtend: `${dateStr}T${slot.end.replace(":", "")}00`,
      description: `Meeting about ${interestedModel}. Stock: ${car.stockNumber}. ${notes ?? ""}`,
      location: "AutoShip DZ Showroom",
    };

    // WhatsApp deep link
    const whatsAppMessage = encodeURIComponent(
      `Hello AutoShip DZ! I'd like to confirm my meeting on ${preferredDate.split("T")[0]} (${preferredTimeSlot}) about ${interestedModel} (${car.stockNumber}).`,
    );
    const whatsAppLink = `https://wa.me/213555000000?text=${whatsAppMessage}`;

    logActivity({
      type: "meeting_booked",
      title: `Meeting booked: ${interestedModel}`,
      description: `${preferredDate.split("T")[0]} · ${preferredTimeSlot}`,
      entityId: lead._id as any,
      entityType: "lead",
      performedBy: authReq.user.id,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      lead,
      meeting: {
        preferredDate,
        preferredTimeSlot,
        calendarEvent,
        whatsAppLink,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * GET /api/leads/booked-dates
 * Public — returns all booked date+slot combinations.
 * Used by the frontend to disable already-picked dates.
 */
export async function getBookedDates(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const leads = await LeadModel.find({
      reservationDate: { $ne: null },
      reservationTimeSlot: { $ne: null },
      status: { $nin: ["Lost"] },
    }).select("reservationDate reservationTimeSlot");

    const bookedSlots = leads.map((l) => ({
      date: l.reservationDate ? l.reservationDate.toISOString().split("T")[0] : null,
      timeSlot: l.reservationTimeSlot,
    }));

    res.status(StatusCodes.OK).json({
      success: true,
      bookedSlots,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * DELETE /api/leads/:id
 * Admin only — delete a lead.
 */
export async function deleteLead(req: Request, res: Response): Promise<void> {
  try {
    const lead = await LeadModel.findByIdAndDelete(req.params.id);
    if (!lead) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Lead not found" },
      });
      return;
    }

    logActivity({
      type: "lead_deleted",
      title: `Reservation deleted: ${lead.name}`,
      description: `Was interested in ${lead.interestedModel || "—"}`,
      entityId: lead._id as any,
      entityType: "lead",
      performedBy: (req as AuthenticatedRequest).user?.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * PUT /api/leads/:id/car
 * Admin only — assign (or clear) a car on an existing lead.
 * Does NOT change lead status. Used when the interested car wasn't stored originally.
 */
export async function assignCarToLead(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { carId } = req.body as { carId: string | null };

    const lead = await LeadModel.findById(req.params.id);
    if (!lead) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Lead not found" },
      });
      return;
    }

    if (carId) {
      const car = await CarModel.findById(carId);
      if (!car) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: { message: "Car not found" },
        });
        return;
      }
      lead.carId = carId as unknown as import("mongoose").Types.ObjectId;
    } else {
      lead.carId = null as unknown as import("mongoose").Types.ObjectId;
    }

    await lead.save();

    const updatedLead = await LeadModel.findById(req.params.id)
      .populate("submittedBy", "name email")
      .populate({
        path: "carId",
        select: "stockNumber photos brand model year color status",
        populate: [
          { path: "brand", select: "name" },
          { path: "model", select: "name" },
        ],
      });

    res.status(StatusCodes.OK).json({
      success: true,
      message: carId ? "Car assigned to lead" : "Car unlinked from lead",
      lead: updatedLead,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}
