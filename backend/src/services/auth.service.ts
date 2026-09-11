import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import AppError from "../utils/app-error.util";
import { hashPassword } from "../utils/password.util";
import { sendEmail } from "../utils/email.util";
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from "../utils/token.util";
import {
  RegisterUserInput,
  ResetPasswordInput,
} from "../validators/auth.validation";

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

  // Send the verification email, but never let a mail failure block registration.
  let emailSent = true;
  try {
    const emailVerificationToken = generateEmailVerificationToken(
      newUser._id.toString(),
    );

    await sendEmail({
      to: newUser.email,
      subject: "Verify your email address",
      text: `Welcome! Please verify your email address by clicking the link below (valid for 10 minutes):\n\n${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}\n\nIf you didn't create an account, you can ignore this email.`,
      html: `<p>Welcome! Please verify your email address by clicking the link below (valid for 10 minutes):</p><p><a href="${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}">Verify email</a></p><p>If you didn't create an account, you can ignore this email.</p>`,
    });
  } catch (error) {
    emailSent = false;
    console.error("[email] Failed to send verification email:", error);
  }

  return {
    user: {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    accessToken,
    refreshToken,
    emailSent,
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

export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const user = await User.findOne({
    "refreshTokens.token": refreshToken,
  }).select("+refreshTokens");

  if (!user) {
    throw new AppError("Invalid refresh token", 401);
  }

  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.token !== refreshToken,
  );

  await user.save();

  return true;
};

export const verifyEmail = async (token: string) => {


  console.log("Verifying email with token:", token);


  let decodedToken: { userId: string };

  try {
    decodedToken = jwt.verify(
      token,
      process.env.EMAIL_VERIFY_TOKEN_SECRET!,
    ) as { userId: string };
  } catch (error) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isEmailVerified = true;
  await user.save();

  return true;
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether an account exists for this email.
    return true;
  }

  const resetToken = generatePasswordResetToken(user._id.toString());
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  // A mail failure here shouldn't reveal anything or crash the request.
  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text: `You requested a password reset. Click the link below to set a new password (valid for 15 minutes):\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`,
      html: `<p>You requested a password reset. Click the link below to set a new password (valid for 15 minutes):</p><p><a href="${resetLink}">Reset password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });
  } catch (error) {
    console.error("[email] Failed to send password reset email:", error);
  }

  return true;
};

export const resetPassword = async ({
  token,
  password,
}: ResetPasswordInput) => {
  let decodedToken: { userId: string };

  try {
    decodedToken = jwt.verify(
      token,
      process.env.PASSWORD_RESET_TOKEN_SECRET!,
    ) as { userId: string };
  } catch (error) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const user = await User.findById(decodedToken.userId).select("+refreshTokens");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const hashedPassword = await hashPassword(password);
  user.password = hashedPassword;

  // Invalidate existing sessions so old tokens can't be used after a reset.
  user.refreshTokens = [];

  await user.save();

  return true;
};
