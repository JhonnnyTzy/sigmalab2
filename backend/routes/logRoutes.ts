import { Router } from "express";
import * as logController from "../controllers/logController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createLogSchema } from "../schemas/logSchemas";

const router = Router();

router.use(authenticate);

router.get("/", authorize("encargado"), logController.getAll);
router.post("/", validate(createLogSchema), logController.create);

export default router;
