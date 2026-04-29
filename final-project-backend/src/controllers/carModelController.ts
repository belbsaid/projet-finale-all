import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger.js";
import { StatusCodes } from "http-status-codes";
import CarModelModel from "../models/CarModel.js";
import CarModel from "../models/Car.js";
import {
  getPaginationOptions,
  buildPaginationMeta,
} from "../utils/pagination.js";

/**
 * GET /api/models
 * Public — list car models with optional filters.
 * Supports pagination: ?page=1&limit=10
 */
export async function getCarModels(req: Request, res: Response): Promise<void> {
  try {
    const { brand, category, year, isActive } = req.query;

    const query: Record<string, unknown> = {};
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (year) query.year = Number(year);
    if (isActive !== undefined) query.isActive = isActive === "true";

    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await CarModelModel.countDocuments(query);
    const models = await CarModelModel.find(query)
      .populate("brand", "name origin logo")
      .populate("category", "name")
      .sort({ year: -1, popularity: -1 })
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      models,
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
 * GET /api/models/:id
 * Public — single car model by ID with full population.
 */
export async function getCarModel(req: Request, res: Response): Promise<void> {
  try {
    const carModel = await CarModelModel.findById(req.params.id)
      .populate("brand", "name origin logo warrantyYears hasLocalServiceCenter")
      .populate("category", "name description");

    if (!carModel) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Model not found" },
      });
      return;
    }
    res.status(StatusCodes.OK).json({ success: true, model: carModel });
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
 * POST /api/models
 * Admin only — create a car model.
 */
export async function createCarModel(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const carModel = await CarModelModel.create(req.body);

    logActivity({
      type: "model_created",
      title: `Model created: ${carModel.name}`,
      description: `Year: ${carModel.year || "N/A"}`,
      entityId: carModel._id as any,
      entityType: "model",
    });

    res.status(StatusCodes.CREATED).json({ success: true, model: carModel });
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
 * PUT /api/models/:id
 * Admin only — update a car model.
 */
export async function updateCarModel(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const carModel = await CarModelModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!carModel) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Model not found" },
      });
      return;
    }
    res.status(StatusCodes.OK).json({ success: true, model: carModel });
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
 * DELETE /api/models/:id
 * Admin only — delete a car model.
 * Blocks deletion if Cars reference this model.
 */
export async function deleteCarModel(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const modelId = req.params.id;

    // Check for references
    const carCount = await CarModel.countDocuments({ model: modelId });
    if (carCount > 0) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        error: {
          message: `Cannot delete model: ${carCount} car(s) still reference it`,
        },
      });
      return;
    }

    const carModel = await CarModelModel.findByIdAndDelete(modelId);
    if (!carModel) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Model not found" },
      });
      return;
    }

    logActivity({
      type: "model_deleted",
      title: `Model deleted: ${carModel.name}`,
      description: `Year: ${carModel.year || "N/A"}`,
      entityId: carModel._id as any,
      entityType: "model",
    });

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Model deleted" });
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
 * GET /api/models/brand/:brandId
 * Public — get active models for a specific brand.
 * Supports pagination: ?page=1&limit=10
 */
export async function getModelsByBrand(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const filter = {
      brand: req.params.brandId,
      isActive: true,
    };
    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await CarModelModel.countDocuments(filter);
    const models = await CarModelModel.find(filter)
      .populate("category", "name")
      .sort({ year: -1, popularity: -1 })
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      models,
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
 * GET /api/models/years
 * Public — list distinct model years (descending).
 */
export async function getModelYears(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const years = await CarModelModel.distinct("year");
    years.sort((a: number, b: number) => b - a);

    res.status(StatusCodes.OK).json({ success: true, years });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}
