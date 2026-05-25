import { Router } from "express";
import * as inventarioController from "../controllers/inventarioController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createInventarioSchema, updateInventarioSchema } from "../schemas/inventarioSchemas";

const router = Router();

router.use(authenticate);

router.get("/", inventarioController.getAll);
router.get("/stats", inventarioController.getStats);
router.get("/:id", inventarioController.getById);
router.post("/", authorize("encargado"), validate(createInventarioSchema), inventarioController.create);
router.patch("/:id", authorize("encargado"), validate(updateInventarioSchema), inventarioController.update);
router.delete("/:id", authorize("encargado"), inventarioController.remove);

export default router;
