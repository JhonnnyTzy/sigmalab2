import { Router } from "express";
import * as insumoController from "../controllers/insumoController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createInsumoSchema, updateInsumoSchema } from "../schemas/insumoSchemas";

const router = Router();

router.use(authenticate);

router.get("/", insumoController.getAll);
router.get("/bajo-stock", insumoController.getBajoStock);
router.get("/:nombre", insumoController.getByNombre);
router.post("/", authorize("encargado"), validate(createInsumoSchema), insumoController.create);
router.patch("/:nombre", authorize("encargado"), validate(updateInsumoSchema), insumoController.update);
router.delete("/:nombre", authorize("encargado"), insumoController.remove);

export default router;
