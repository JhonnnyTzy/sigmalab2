import { Router } from "express";
import * as laboratorioController from "../controllers/laboratorioController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createLaboratorioSchema, updateLaboratorioSchema } from "../schemas/laboratorioSchemas";

const router = Router();

router.use(authenticate);

router.get("/", laboratorioController.getAll);
router.get("/:id", laboratorioController.getById);
router.post("/", authorize("encargado"), validate(createLaboratorioSchema), laboratorioController.create);
router.patch("/:id", authorize("encargado"), validate(updateLaboratorioSchema), laboratorioController.update);
router.delete("/:id", authorize("encargado"), laboratorioController.remove);

export default router;
