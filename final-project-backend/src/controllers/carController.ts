import { Request, Response } from "express";
import { logActivity } from "../utils/activityLogger.js";
import { StatusCodes } from "http-status-codes";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import CarModel from "../models/Car.js";
import DocumentModel from "../models/Document.js";
import type { AuthenticatedRequest } from "../types/express.js";
import {
  getPaginationOptions,
  buildPaginationMeta,
} from "../utils/pagination.js";
import {
  serializePublicCar,
  serializeVinPublic,
  serializeCarForStatic,
  serializeCustomerCar,
} from "../utils/serializers.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /api/cars
 * Public — list cars with optional filters (landing page + admin).
 * Supports pagination: ?page=1&limit=10
 */
export async function getCars(req: Request, res: Response): Promise<void> {
  try {
    const {
      status,
      brand,
      model,
      category,
      minPrice,
      maxPrice,
      color,
      sortBy,
      year,
      minYear,
      maxYear,
      search,
    } = req.query;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (brand && brand !== "all") query.brand = brand;
    if (model && model !== "all") query.model = model;
    if (category && category !== "all") query.category = category;
    if (color) query.color = { $regex: color as string, $options: "i" };

    // Year — exact or range
    if (year) {
      query.year = Number(year);
    } else if (minYear || maxYear) {
      const yearFilter: Record<string, number> = {};
      if (minYear) yearFilter.$gte = Number(minYear);
      if (maxYear) yearFilter.$lte = Number(maxYear);
      query.year = yearFilter;
    }

    // Text search — VIN or stockNumber
    if (search) {
      const s = String(search).trim();
      query.$or = [
        { vin: { $regex: s, $options: "i" } },
        { stockNumber: { $regex: s, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      query.finalPriceDZD = priceFilter;
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === "price-low") sort = { finalPriceDZD: 1 };
    else if (sortBy === "price-high") sort = { finalPriceDZD: -1 };
    else if (sortBy === "newest") sort = { createdAt: -1 };

    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await CarModel.countDocuments(query);
    const lang = req.query.lang === "ar" ? "ar" : "fr";
    const cars = await CarModel.find(query)
      .populate("brand", "name nameAr origin logo")
      .populate(
        "model",
        "name nameAr year engine transmission fuelType features",
      )
      .populate("category", "name nameAr")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const isAdmin = (req as AuthenticatedRequest).user?.role === "admin";

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      cars: isAdmin ? cars : cars.map((c) => serializePublicCar(c, lang)),
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
 * GET /api/cars/vin/public/:vin
 * Public — minimal VIN lookup (status, stockNumber, brand/model name, price).
 */
export async function getCarByVinPublic(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const vin = String(req.params.vin).toUpperCase();

    const car = await CarModel.findOne({ vin })
      .populate("brand", "name")
      .populate("model", "name")
      .select("vin stockNumber status brand model finalPriceDZD");

    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "No car found with that VIN" },
      });
      return;
    }

    res
      .status(StatusCodes.OK)
      .json({ success: true, car: serializeVinPublic(car) });
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
 * GET /api/cars/vin/:vin
 * Protected — customer-scoped VIN lookup.
 * Customers see only cars linked to their account (customerId === req.user.id).
 * Admins can see any car by VIN.
 */
export async function getCarStatusByVin(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const vin = String(req.params.vin).toUpperCase();

    // Build query: admins see all, customers only their own cars
    const query: Record<string, unknown> = { vin };
    if (authReq.user.role !== "admin") {
      query.customerId = authReq.user.id;
    }

    const car = await CarModel.findOne(query)
      .populate("brand", "name logo")
      .populate("model", "name year");

    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          message:
            "Car not found or you do not have permission to view this vehicle",
        },
      });
      return;
    }

    res
      .status(StatusCodes.OK)
      .json({ success: true, car: serializeCustomerCar(car) });
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
 * GET /api/cars/:id
 * Public — single car with full population (serialized, no sensitive fields).
 */
export async function getCar(req: Request, res: Response): Promise<void> {
  try {
    const lang = req.query.lang === "ar" ? "ar" : "fr";
    const car = await CarModel.findById(req.params.id)
      .populate(
        "brand",
        "name nameAr origin logo description warrantyYears hasLocalServiceCenter",
      )
      .populate(
        "model",
        "name nameAr year generation engine horsepower transmission fuelType fuelConsumption features description images",
      )
      .populate("category", "name nameAr description");

    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }
    res
      .status(StatusCodes.OK)
      .json({ success: true, car: serializePublicCar(car, lang) });
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
 * POST /api/cars
 * Admin only — create a car. Auto-generates stockNumber if omitted.
 */
export async function createCar(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const carData: any = {
      ...req.body,
      createdBy: authReq.user.id,
      updatedBy: authReq.user.id,
      statusHistory: [
        {
          status: req.body.status || "In Transit",
          date: new Date(),
          changedBy: authReq.user.id,
          note: "Initial creation",
        },
      ],
    };

    if (!carData.stockNumber) {
      const count = await CarModel.countDocuments();
      carData.stockNumber = `STOCK-${String(count + 1).padStart(5, "0")}`;
    }

    const car = await CarModel.create(carData);
    await car.populate("brand model category");

    const brandName = typeof car.brand === "object" && car.brand ? (car.brand as any).name : "Unknown";
    const modelName = typeof car.model === "object" && car.model ? (car.model as any).name : "";
    logActivity({
      type: "car_created",
      title: `New car added: ${brandName} ${modelName}`.trim(),
      description: `Stock #${car.stockNumber} · Status: ${car.status}`,
      entityId: car._id as any,
      entityType: "car",
      performedBy: authReq.user.id,
    });

    res.status(StatusCodes.CREATED).json({ success: true, car });
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
 * PUT /api/cars/:id
 * Admin only — update a car.
 */
export async function updateCar(req: Request, res: Response): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // Prevent accidental overriding of photos if client sends empty array
    if (req.body.photos && req.body.photos.length === 0) {
      delete req.body.photos;
    }

    const updateData = {
      ...req.body,
      updatedBy: authReq.user.id,
    };

    const car = await CarModel.findById(req.params.id);

    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }

    // Merge new specs carefully to not wipe out unprovided fields like warranty or fuelConsumption
    if (updateData.specs) {
      updateData.specs = { ...car.specs, ...updateData.specs };
    }
    
    Object.assign(car, updateData);
    await car.save();
    
    await car.populate("brand model category");

    res.status(StatusCodes.OK).json({ success: true, car });
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
 * DELETE /api/cars/:id
 * Admin only — delete a car and its associated documents.
 */
export async function deleteCar(req: Request, res: Response): Promise<void> {
  try {
    const car = await CarModel.findById(req.params.id)
      .populate("brand", "name")
      .populate("model", "name");
    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }

    const brandName = typeof car.brand === "object" && car.brand ? (car.brand as any).name : "Unknown";
    const modelName = typeof car.model === "object" && car.model ? (car.model as any).name : "";

    await CarModel.findByIdAndDelete(req.params.id);

    if (car.documents && car.documents.length > 0) {
      await DocumentModel.deleteMany({ _id: { $in: car.documents } });
    }

    logActivity({
      type: "car_deleted",
      title: `Car deleted: ${brandName} ${modelName}`.trim(),
      description: `Stock #${car.stockNumber}`,
      entityId: car._id as any,
      entityType: "car",
      performedBy: (req as AuthenticatedRequest).user?.id,
    });

    res.status(StatusCodes.OK).json({ success: true, message: "Car deleted" });
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
 * PUT /api/cars/:id/status
 * Admin only — update car status.
 * Auto-sets arrivalDate when → "In Stock", soldDate when → "Sold".
 * Clears dates when reverting away from those statuses.
 */
export async function updateCarStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { status } = req.body as { status: string };

    // Fetch current car to determine status transition
    const currentCar = await CarModel.findById(req.params.id);
    if (!currentCar) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }

    // Build update with auto-date logic
    const updateData: any = {
      status,
      updatedBy: authReq.user.id,
    };

    // Set arrivalDate when transitioning TO "In Stock"
    if (status === "In Stock" && currentCar.status !== "In Stock") {
      updateData.arrivalDate = new Date();
    }

    // Set soldDate when transitioning TO "Sold"
    if (status === "Sold" && currentCar.status !== "Sold") {
      updateData.soldDate = new Date();
    }

    // Clear dates when reverting FROM those statuses
    if (status !== "Sold" && currentCar.status === "Sold") {
      updateData.soldDate = null;
    }
    if (status !== "In Stock" && currentCar.status === "In Stock") {
      updateData.arrivalDate = null;
    }

    if (status !== currentCar.status) {
      updateData.$push = {
        statusHistory: {
          status,
          date: new Date(),
          changedBy: authReq.user.id,
        },
      };
    }

    const car = await CarModel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("brand", "name logo")
      .populate("model", "name year")
      .populate("category", "name");

    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }

    const brandName =
      typeof car.brand === "object" && car.brand ? (car.brand as any).name : "Unknown";
    const modelName =
      typeof car.model === "object" && car.model ? (car.model as any).name : "";
    logActivity({
      type: "car_status_changed",
      title: `Car status → ${status}`,
      description: `${brandName} ${modelName} · Stock #${currentCar.stockNumber}`.trim(),
      entityId: car._id as any,
      entityType: "car",
      performedBy: authReq.user.id,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Car status updated to "${status}"`,
      car,
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
 * GET /api/cars/status/:status
 * Admin only — list cars filtered by a specific status.
 * Supports pagination: ?page=1&limit=10
 */
export async function getCarsByStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const filter = { status: req.params.status };
    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await CarModel.countDocuments(filter);
    const cars = await CarModel.find(filter)
      .populate("brand", "name")
      .populate("model", "name year")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      cars,
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
 * GET /api/cars/stats
 * Admin only — inventory statistics.
 */
export async function getCarStats(_req: Request, res: Response): Promise<void> {
  try {
    const totalCars = await CarModel.countDocuments();

    const carsByStatus = await CarModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const carsByBrand = await CarModel.aggregate([
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brandInfo",
        },
      },
      { $unwind: "$brandInfo" },
      { $project: { brand: "$brandInfo.name", count: 1, _id: 0 } },
    ]);

    const totalValueResult = await CarModel.aggregate([
      { $group: { _id: null, total: { $sum: "$costPriceDZD" } } },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalCars,
        carsByStatus,
        carsByBrand,
        totalInventoryValueDZD: totalValueResult[0]?.total ?? 0,
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
 * POST /api/cars/:id/photos
 * Admin only — upload photos to a car.
 * Uses the `uploadPhotos` middleware (field: "photos", max 10 files).
 */
export async function uploadCarPhotos(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { message: "No photos uploaded" },
      });
      return;
    }

    const car = await CarModel.findById(req.params.id);
    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }

    const photoUrls: string[] = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer, "final_project");
      photoUrls.push(result.secure_url);
    }

    car.photos.push(...photoUrls);
    await car.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${files.length} photo(s) uploaded`,
      photos: car.photos,
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
 * DELETE /api/cars/:id/photos
 * Admin only — remove a photo from a car by filename.
 * Expects body: { filename: "photos-1234567890.jpg" }
 */
export async function deleteCarPhoto(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { filename } = req.body as { filename: string };
    if (!filename) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { message: "filename is required in request body" },
      });
      return;
    }

    const targetUrl = filename.startsWith("http")
      ? filename
      : `/uploads/${filename}`;

    const car = await CarModel.findById(req.params.id);
    if (!car) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Car not found" },
      });
      return;
    }

    if (!car.photos.includes(targetUrl)) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Photo not found on this car" },
      });
      return;
    }

    // Remove from array
    car.photos = car.photos.filter((p) => p !== targetUrl);
    await car.save();

    // Delete file from disk or Cloudinary
    if (targetUrl.includes("res.cloudinary.com")) {
      const urlObj = new URL(targetUrl);
      const pathParts = urlObj.pathname.split("/");
      const uploadIndex = pathParts.indexOf("upload");
      if (uploadIndex !== -1) {
        let startIdx = uploadIndex + 1;
        if (
          pathParts[startIdx].startsWith("v") &&
          !isNaN(parseInt(pathParts[startIdx].substring(1)))
        ) {
          startIdx++;
        }
        const publicIdWithExt = pathParts.slice(startIdx).join("/");
        const publicId =
          publicIdWithExt.split(".").slice(0, -1).join(".") || publicIdWithExt;
        if (publicId) {
          await deleteFromCloudinary(publicId).catch((err) =>
            console.error(err),
          );
        }
      }
    } else {
      const filePath = path.join(__dirname, "..", "..", targetUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Photo deleted",
      photos: car.photos,
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
 * GET /api/cars/static
 * Public — returns minimal car data for Next.js static generation.
 * Used by `generateStaticParams()` to pre-render car pages.
 */
export async function getCarsForStaticGeneration(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const cars = await CarModel.find({
      status: { $in: ["In Stock", "Reserved", "In Transit"] },
    }).select("stockNumber updatedAt");

    res.status(StatusCodes.OK).json({
      success: true,
      cars: cars.map((c) => serializeCarForStatic(c)),
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
 * GET /api/cars/customer/my-cars
 * Protected — returns all cars linked to the logged-in customer.
 * Excludes cars with status "Damaged".
 */
export async function getCustomerCars(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;

    const cars = await CarModel.find({
      customerId: authReq.user.id,
      status: { $ne: "Damaged" },
    })
      .populate("brand", "name logo")
      .populate("model", "name year")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: cars.length,
      cars: cars.map((c) => serializeCustomerCar(c)),
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
