import { IUser } from "../interfaces/user.interface";
import User from "../models/user.model";
import AppError from "../utils/app-error.util";
import { UpdateUserProfileInput } from "../validators/user.validation";

export const getCurrentUser = async (user: IUser) => {
  return user;
};

export const updateUserProfile = async (
  userId: string,
  updateData: UpdateUserProfileInput,
) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -refreshTokens");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};