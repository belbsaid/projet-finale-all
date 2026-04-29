import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import CarModel from "../models/Car.js";
import LeadModel from "../models/Lead.js";

/**
 * GET /api/reports/stats
 * Admin only — dashboard statistics.
 */
export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const totalCars = await CarModel.countDocuments();
    const carsInStock = await CarModel.countDocuments({ status: "In Stock" });
    const carsSold = await CarModel.countDocuments({ status: "Sold" });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const leadsThisWeek = await LeadModel.countDocuments({
      createdAt: { $gte: lastWeek },
    });

    const totalLeads = await LeadModel.countDocuments();

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalCars,
        carsInStock,
        carsSold,
        totalLeads,
        leadsThisWeek,
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
 * GET /api/reports/revenue?month=1&year=2026
 * Admin only — revenue for sold cars in a given month.
 */
export async function getMonthlyRevenue(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { message: "month and year query parameters are required" },
      });
      return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const cars = await CarModel.find({
      status: "Sold",
      soldDate: { $gte: startDate, $lte: endDate },
    });

    const totalRevenue = cars.reduce(
      (sum, car) => sum + (car.finalPriceDZD ?? 0),
      0,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        month,
        year,
        totalRevenue,
        carsSold: cars.length,
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
 * GET /api/reports/top-models
 * Admin only — top 5 sold models by count.
 */
export async function getTopModels(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const topModels = await CarModel.aggregate([
      { $match: { status: "Sold" } },
      { $group: { _id: "$model", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "carmodels",
          localField: "_id",
          foreignField: "_id",
          as: "modelInfo",
        },
      },
      { $unwind: { path: "$modelInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          model: "$modelInfo.name",
          count: 1,
        },
      },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: topModels,
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
