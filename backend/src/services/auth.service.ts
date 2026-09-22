import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import AppError from "../utils/app-error.util";
import { hashPassword } from "../utils/password.util";
import { sendEmail } from "../utils/email.util";
import {
  passwordResetEmail,
  verificationEmail,
} from "../utils/email-templates.util";
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from "../utils/token.util";
import {
  RegisterUserInput,
  ResendVerificationInput,
  ResetPasswordInput,
} from "../validators/auth.validation";

/**
 * Sends the "confirm your address" link.
 *
 * The token rides as a path segment (`/verify-email/<token>`) to match the
 * frontend route. Shared by register and resend so the two cannot drift apart.
 */
const sendVerificationEmail = async (user: {
  _id: unknown;
  name: string;
  email: string;
}): Promise<void> => {
  const emailVerificationToken = generateEmailVerificationToken(
    String(user._id),
  );
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;

  await sendEmail({
    to: user.email,
    ...verificationEmail({
      name: user.name,
      url: verifyUrl,
      // Matches the 10m lifetime generateEmailVerificationToken signs for.
      expiresInMinutes: 10,
    }),
  });
};

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
    await sendVerificationEmail(newUser);
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
  let decodedToken: { userId: string };

  try {
    decodedToken = jwt.verify(
      token,
      process.env.EMAIL_VERIFY_TOKEN_SECRET!,
    ) as { userId: string };
  } catch (error) {
    // Expiry is worth separating from a token we can't read at all: the UI can
    // offer a fresh link for one, and must not imply tampering for the other.
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Verification link has expired", 410);
    }

    throw new AppError("Invalid verification token", 400);
  }

  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Following an old link a second time is not a failure — report it as such so
  // the UI can say the address was already confirmed rather than claiming a
  // fresh success.
  if (user.isEmailVerified) {
    return { alreadyVerified: true };
  }

  user.isEmailVerified = true;
  await user.save();

  return { alreadyVerified: false };
};

/**
 * Issues a fresh verification link.
 *
 * Silently succeeds for an unknown address and for one that is already
 * verified, so the endpoint can't be used to discover which emails have
 * accounts — the same reasoning as `forgotPassword`.
 */
export const resendVerificationEmail = async ({
  email,
}: ResendVerificationInput) => {
  const user = await User.findOne({ email });

  if (!user || user.isEmailVerified) {
    return true;
  }

  // A mail failure here must not reveal that the account exists either.
  try {
    await sendVerificationEmail(user);
  } catch (error) {
    console.error("[email] Failed to resend verification email:", error);
  }

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
      ...passwordResetEmail({
        name: user.name,
        url: resetLink,
        // Matches the 15m lifetime generatePasswordResetToken signs for.
        expiresInMinutes: 15,
      }),
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
