import { Router } from "express";
import {
  createDoctorSession,
  createLabSession,
} from "../controllers/session.controller";

const router = Router();

router.get("/getAll/:centerId");
router.post("/create/doctor-session", createDoctorSession);
router.post("/create/lab-session", createLabSession);

export default router;
