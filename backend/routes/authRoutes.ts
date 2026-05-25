import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginSchema, updateProfileSchema } from "../schemas/authSchemas";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.get("/profile", authenticate, authController.profile);
router.patch("/profile", authenticate, validate(updateProfileSchema), authController.updateProfile);
router.get("/", authenticate, authorize("encargado"), authController.getAllUsers);
router.patch("/:id", authenticate, authorize("encargado"), authController.updateUser);
router.delete("/:id", authenticate, authorize("encargado"), authController.removeUser);

export default router;
