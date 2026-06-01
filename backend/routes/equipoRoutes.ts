import { Router } from "express";
import * as equipoController from "../controllers/equipoController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createEquipoSchema, updateEquipoSchema, decommissionEquipoSchema, replaceEquipoSchema } from "../schemas/equipoSchemas";

const router = Router();

router.use(authenticate);

router.get("/", equipoController.getAll);
router.get("/estadisticas", equipoController.getEstadisticas);
router.get("/:codigo", equipoController.getByCodigo);
router.post("/", authorize("encargado"), validate(createEquipoSchema), equipoController.create);
router.patch("/:codigo", authorize("encargado"), validate(updateEquipoSchema), equipoController.update);
router.post("/:codigo/decommission", authorize("encargado"), validate(decommissionEquipoSchema), equipoController.decommission);
router.post("/:codigo/replace", authorize("encargado"), validate(replaceEquipoSchema), equipoController.replace);
router.delete("/:codigo", authorize("encargado"), equipoController.remove);

export default router;
