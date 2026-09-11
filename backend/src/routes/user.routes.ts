import { Router } from "express";
import {
  getCurrentUserController,
  updateUserProfileController,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateUserProfileSchema } from "../validators/user.validation";

const router = Router();

router.get("/profile", authenticate, getCurrentUserController);

router.patch(
  "/profile",
  authenticate,
  validate(updateUserProfileSchema),
  updateUserProfileController,
);

export default router;
