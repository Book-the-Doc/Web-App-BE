import { Router } from "express";
import {
  createMedicalTest,
  getMedicalTestById,
} from "../controllers/medical-test.controller";
import authGuard from "../middlewares/auth.guard";
import rolesGuard from "../middlewares/role.guard";

const router = Router();

router.post("/create", authGuard, rolesGuard(["center"]), createMedicalTest);
router.get("/get/:testId", getMedicalTestById);

export default router;
