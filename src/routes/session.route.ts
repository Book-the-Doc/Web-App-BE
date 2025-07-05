import { Router } from "express";
import {
  createDoctorSession,
  createLabSession,
  getLabSessionsByIds,
} from "../controllers/session.controller";
import authGuard from "../middlewares/auth.guard";
import rolesGuard from "../middlewares/role.guard";

const router = Router();

router.get("/getAll/:centerId");
router.post("/create/doctor-session", createDoctorSession);
router.post(
  "/create/lab-session",
  authGuard,
  rolesGuard(["center"]),
  createLabSession,
);
router.post("/getLabSessionsByIds", getLabSessionsByIds);

export default router;
