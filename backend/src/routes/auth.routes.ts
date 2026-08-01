import { Router } from "express";
import {
  registerController,
  loginController,
  refreshTokenController,
} from "../controllers/auth.controller";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validators/auth.validation";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

router.post("/register", validate(registerUserSchema), registerController);

router.post("/login", validate(loginUserSchema), loginController);

router.post("/refresh-token", refreshTokenController);

export default router;
