import { Request, Response, NextFunction } from "express";
import AppError from "../utils/app-error.util";

export const authorizeRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("unathorized", 401);
    }

    if (!roles.includes(req?.user?.role)) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
