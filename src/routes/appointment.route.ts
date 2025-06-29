import { Router } from "express";
import {
  createAppointment,
  getAppointmentsBySessionId,
  getUserAppointmentsBySessionId,
} from "../controllers/appointment.controller";

const router = Router();

router.post("/create", createAppointment);
router.get("/getAppointments/:sessionId", getAppointmentsBySessionId);
router.get(
  "/getUserAppointments/:sessionId/:userId",
  getUserAppointmentsBySessionId,
);

export default router;
