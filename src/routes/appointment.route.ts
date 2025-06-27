import { Router } from "express";
import {
  createAppointment,
  getAppointmentsBySessionId,
} from "../controllers/appointment.controller";

const router = Router();

router.post("/create", createAppointment);
router.get("/getAppointments/:sessionId", getAppointmentsBySessionId);

export default router;
