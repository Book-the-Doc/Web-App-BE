import { Router } from "express";
import { createAppointment } from "../controllers/appointment.controller";
const router = Router();

router.post("/create", createAppointment);

export default router;
