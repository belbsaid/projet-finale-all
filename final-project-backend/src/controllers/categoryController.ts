import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger.js";
import { StatusCodes } from "http-status-codes";
import CategoryModel from "../models/Category.js";
import CarModelModel from "../models/CarModel.js";
import {
  getPaginationOptions,
  buildPaginationMeta,
} from "../utils/pagination.js";

/**
 * GET /api/categories
 * Public — list all categories, sorted by sortOrder.
 * Supports pagination: ?page=1&limit=10
 */
export async function getCategories(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await CategoryModel.countDocuments();
    const categories = await CategoryModel.find()
      .sort({ sortOrder: 1 })
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      categories,
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
 * GET /api/categories/:id
 * Public — single category by ID.
 */
export async function getCategory(req: Request, res: Response): Promise<void> {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Category not found" },
      });
      return;
    }
    res.status(StatusCodes.OK).json({ success: true, category });
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
 * POST /api/categories
 * Admin only — create a category.
 */
export async function createCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const category = await CategoryModel.create(req.body);

    logActivity({
      type: "category_created",
      title: `Category created: ${category.name}`,
      description: category.description || "New category added",
      entityId: category._id as any,
      entityType: "category",
    });

    res.status(StatusCodes.CREATED).json({ success: true, category });
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
 * PUT /api/categories/:id
 * Admin only — update a category.
 */
export async function updateCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const category = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!category) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Category not found" },
      });
      return;
    }
    res.status(StatusCodes.OK).json({ success: true, category });
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
 * DELETE /api/categories/:id
 * Admin only — delete a category.
 * Blocks deletion if CarModels reference this category.
 */
export async function deleteCategory(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const categoryId = req.params.id;

    // Check for references
    const modelCount = await CarModelModel.countDocuments({
      category: categoryId,
    });
    if (modelCount > 0) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        error: {
          message: `Cannot delete category: ${modelCount} model(s) still reference it`,
        },
      });
      return;
    }

    const category = await CategoryModel.findByIdAndDelete(categoryId);
    if (!category) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Category not found" },
      });
      return;
    }

    logActivity({
      type: "category_deleted",
      title: `Category deleted: ${category.name}`,
      description: category.description || "",
      entityId: category._id as any,
      entityType: "category",
    });

    res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}
