import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger.js";
import { StatusCodes } from "http-status-codes";
import BrandModel from "../models/Brand.js";
import CarModelModel from "../models/CarModel.js";
import CarModel from "../models/Car.js";
import {
  getPaginationOptions,
  buildPaginationMeta,
} from "../utils/pagination.js";

/**
 * GET /api/brands
 * Public — list brands with optional filters.
 * Supports pagination: ?page=1&limit=10
 */
export async function getBrands(req: Request, res: Response): Promise<void> {
  try {
    const { origin, isActive, sortBy } = req.query;

    const query: Record<string, unknown> = {};
    if (origin) query.origin = origin;
    if (isActive !== undefined) query.isActive = isActive === "true";

    let sort: Record<string, 1 | -1> = {};
    if (sortBy === "popularity") sort = { popularity: -1 };
    else if (sortBy === "name") sort = { name: 1 };

    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await BrandModel.countDocuments(query);
    const brands = await BrandModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      brands,
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
 * GET /api/brands/popular
 * Public — top 10 active brands by popularity.
 */
export async function getPopularBrands(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const brands = await BrandModel.find({ isActive: true })
      .sort({ popularity: -1 })
      .limit(10);

    res.status(StatusCodes.OK).json({
      success: true,
      count: brands.length,
      brands,
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
 * GET /api/brands/:id
 * Public — single brand by ID.
 */
export async function getBrand(req: Request, res: Response): Promise<void> {
  try {
    const brand = await BrandModel.findById(req.params.id);
    if (!brand) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: { message: "Brand not found" } });
      return;
    }
    res.status(StatusCodes.OK).json({ success: true, brand });
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
 * POST /api/brands
 * Admin only — create a brand.
 */
export async function createBrand(req: Request, res: Response): Promise<void> {
  try {
    const brand = await BrandModel.create(req.body);

    logActivity({
      type: "brand_created",
      title: `Brand created: ${brand.name}`,
      description: brand.origin ? `Origin: ${brand.origin}` : "New brand added",
      entityId: brand._id as any,
      entityType: "brand",
    });

    res.status(StatusCodes.CREATED).json({ success: true, brand });
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
 * PUT /api/brands/:id
 * Admin only — update a brand.
 */
export async function updateBrand(req: Request, res: Response): Promise<void> {
  try {
    const brand = await BrandModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!brand) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: { message: "Brand not found" } });
      return;
    }
    res.status(StatusCodes.OK).json({ success: true, brand });
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
 * DELETE /api/brands/:id
 * Admin only — delete a brand.
 * Blocks deletion if CarModels or Cars reference this brand.
 */
export async function deleteBrand(req: Request, res: Response): Promise<void> {
  try {
    const brandId = req.params.id;

    // Check for references
    const modelCount = await CarModelModel.countDocuments({ brand: brandId });
    const carCount = await CarModel.countDocuments({ brand: brandId });
    if (modelCount > 0 || carCount > 0) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        error: {
          message: `Cannot delete brand: ${modelCount} model(s) and ${carCount} car(s) still reference it`,
        },
      });
      return;
    }

    const brand = await BrandModel.findByIdAndDelete(brandId);
    if (!brand) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: { message: "Brand not found" } });
      return;
    }

    logActivity({
      type: "brand_deleted",
      title: `Brand deleted: ${brand.name}`,
      description: brand.origin ? `Origin: ${brand.origin}` : "",
      entityId: brand._id as any,
      entityType: "brand",
    });

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Brand deleted" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}
