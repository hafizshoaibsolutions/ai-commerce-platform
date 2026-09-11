import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId,purpose: "access-token" }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId ,purpose: "refresh-token" }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

export const generateEmailVerificationToken = (userId: string): string => {
  return jwt.sign({ userId, purpose: "email-verification" }, process.env.EMAIL_VERIFY_TOKEN_SECRET!, {
    expiresIn: "10m",
  });
};

export const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign({ userId, purpose: "password-reset" }, process.env.PASSWORD_RESET_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};
