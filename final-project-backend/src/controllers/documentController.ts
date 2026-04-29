import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import DocumentModel from "../models/Document.js";
import CarModel from "../models/Car.js";
import type { AuthenticatedRequest } from "../types/express.js";
import {
  getPaginationOptions,
  buildPaginationMeta,
} from "../utils/pagination.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /api/documents/upload
 * Admin only — upload a document and link it to a car.
 * Expects multipart form with field "file" + body fields "carId" and "type".
 */
export async function uploadDocument(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { message: "No file uploaded" },
      });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const { carId, type } = req.body as { carId: string; type: string };

    const car = await CarModel.findById(carId);
    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }

    const document = await DocumentModel.create({
      car: carId,
      type,
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: authReq.user.id,
    });

    car.documents.push(document._id);
    await car.save();

    res.status(StatusCodes.CREATED).json({ success: true, document });
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
 * GET /api/documents/my-documents
 * Protected — get all documents for cars bought by the user.
 */
export async function getMyDocuments(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const userEmail = authReq.user.email;
    const userPhone = authReq.user.phone;

    // 1. Get IDs of cars directly owned by the user
    const directCars = await CarModel.find({ customerId: userId }).select("_id");
    const carIds = new Set(directCars.map((c) => c._id.toString()));

    // 2. Get IDs of cars from "Sold" leads connected to the user
    const { default: LeadModel } = await import("../models/Lead.js");
    
    const leadQuery = {
      status: "Sold",
      $or: [
        { submittedBy: userId },
        ...(userEmail ? [{ email: userEmail }] : []),
        ...(userPhone ? [{ phone: userPhone }] : []),
      ],
    };

    const soldLeads = await LeadModel.find(leadQuery).select("carId");
    soldLeads.forEach((lead) => {
      if (lead.carId) carIds.add(lead.carId.toString());
    });

    // 3. Fetch all documents for these cars
    const documents = await DocumentModel.find({ car: { $in: Array.from(carIds) } })
      .populate({
        path: "car",
        select: "brand model year",
        populate: [
          { path: "brand", select: "name" },
          { path: "model", select: "name" }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      documents,
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
 * GET /api/documents/car/:carId
 * Admin only — get all documents for a specific car.
 * Supports pagination: ?page=1&limit=10
 */
export async function getDocumentsByCar(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const filter = { car: req.params.carId };
    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await DocumentModel.countDocuments(filter);
    const documents = await DocumentModel.find(filter)
      .populate("uploadedBy", "name email")
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      documents,
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
 * GET /api/documents
 * Admin only — get all documents (for global admin dashboard table).
 * Supports pagination: ?page=1&limit=10
 */
export async function getAllDocuments(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await DocumentModel.countDocuments();
    const documents = await DocumentModel.find()
      .populate("car", "vin stockNumber brand model")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      documents,
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
 * DELETE /api/documents/:id
 * Admin only — delete a document from DB and disk.
 */
export async function deleteDocument(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const document = await DocumentModel.findById(req.params.id);
    if (!document) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Document not found" },
      });
      return;
    }

    // Remove file from disk
    const filePath = path.join(__dirname, "..", "..", document.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove reference from car
    await CarModel.findByIdAndUpdate(document.car, {
      $pull: { documents: document._id },
    });

    await DocumentModel.findByIdAndDelete(req.params.id);

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Document deleted" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}
