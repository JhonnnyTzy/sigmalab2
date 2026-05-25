import { Router } from "express";
import * as materiaController from "../controllers/materiaController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.get("/laboratorio/:laboratorioId", materiaController.getHorariosByLab);

export default router;
