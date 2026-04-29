import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  getCloudinaryPhotos,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

export const fetchPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const folder = (req.query.folder as string) || "car-imports";
    const photos = await getCloudinaryPhotos(folder);

    res.status(StatusCodes.OK).json({
      success: true,
      data: photos,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, error: { message: "No file uploaded" } });
      return;
    }

    const folder = (req.body.folder as string) || "car-imports";
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, error: { message: "Public ID is required" } });
      return;
    }

    const result = await deleteFromCloudinary(publicId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
