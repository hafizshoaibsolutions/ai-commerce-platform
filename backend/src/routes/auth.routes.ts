import { Router } from "express";
import { registerController } from "../controllers/auth.controller";
import { registerUserSchema } from "../validators/auth.validation";
import { validate } from "../middlewares/validate.middleware";




const router = Router();

router.post("/register",validate(registerUserSchema), registerController);

export default router;
