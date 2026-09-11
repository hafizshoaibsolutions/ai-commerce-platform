import { Request, Response, NextFunction } from "express";
import { getCurrentUser, updateUserProfile } from "../services/user.service";
import AppError from "../utils/app-error.util";

export const getCurrentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await getCurrentUser(req.user);

    res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await updateUserProfile(
      req.user._id.toString(),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
