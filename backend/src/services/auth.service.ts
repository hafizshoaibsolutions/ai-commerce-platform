import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import AppError from "../utils/app-error.util";
import { hashPassword } from "../utils/password.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import { RegisterUserInput } from "../validators/auth.validation";

export const registerUser = async (
  userData: RegisterUserInput,
  userAgent?: string,
) => {
  const { name, email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken(newUser._id.toString());
  const refreshToken = generateRefreshToken(newUser._id.toString());

  newUser.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userAgent,
    createdAt: new Date(),
  });

  await newUser.save();

  return {
    user: {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (
  email: string,
  password: string,
  userAgent?: string,
) => {
  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userAgent,
    createdAt: new Date(),
  });

  user.lastLogin = new Date();

  await user.save();

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let decodedToken: any;

  try {
    decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(decodedToken.userId).select(
    "+refreshTokens",
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date(),
  );

  const currentToken = user.refreshTokens.find(
    (rt) => rt.token === refreshToken,
  );

  if (!currentToken) {
    throw new AppError("Refresh token has been revoked or expired", 401);
  }

  const accessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.token !== refreshToken,
  );

  user.refreshTokens.push({
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date(),
    userAgent: currentToken?.userAgent,
  });

  await user.save();

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};
