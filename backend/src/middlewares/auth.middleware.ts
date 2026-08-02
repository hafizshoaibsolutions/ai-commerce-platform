import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../models/user.model";
import AppError from "../utils/app-error.util";

interface JwtPayload {
  userId: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authorization header missing or malformed", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as JwtPayload;

    const user = await User.findById(decoded.userId).select(
      "-password -refreshTokens",
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("User account is inactive", 403);
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
