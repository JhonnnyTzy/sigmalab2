import { Router } from "express";
import * as perifericoController from "../controllers/perifericoController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createPerifericoSchema, updatePerifericoSchema } from "../schemas/perifericoSchemas";

const router = Router();

router.use(authenticate);

router.get("/", perifericoController.getAll);
router.get("/:id", perifericoController.getById);
router.post("/", authorize("encargado"), validate(createPerifericoSchema), perifericoController.create);
router.patch("/:id", authorize("encargado"), validate(updatePerifericoSchema), perifericoController.update);
router.delete("/:id", authorize("encargado"), perifericoController.remove);

export default router;
