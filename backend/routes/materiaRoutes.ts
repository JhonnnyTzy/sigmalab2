import { Router } from "express";
import * as materiaController from "../controllers/materiaController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/", materiaController.getAllMaterias);
router.get("/:codigo", materiaController.getMateriaByCodigo);
router.get("/:codigo/grupos", materiaController.getAllGrupos);

export default router;
