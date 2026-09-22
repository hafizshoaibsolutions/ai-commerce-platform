import { Router } from "express";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller";
import {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from "../validators/auth.validation";
import { validate } from "../middlewares/validate.middleware";
import {
  authLimiter,
  passwordResetLimiter,
} from "../middlewares/rate-limit.middleware";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registerUserSchema),
  registerController,
);

router.post("/login", authLimiter, validate(loginUserSchema), loginController);

router.post("/refresh-token", authLimiter, refreshTokenController);

router.post("/logout", logoutController);

router.get("/verify-email/:token", verifyEmailController);

// Sends mail, so it shares the tight email/token limiter rather than the
// credential one.
router.post(
  "/resend-verification",
  passwordResetLimiter,
  validate(resendVerificationSchema),
  resendVerificationController,
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordController,
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  validate(resetPasswordSchema),
  resetPasswordController,
);

export default router;
