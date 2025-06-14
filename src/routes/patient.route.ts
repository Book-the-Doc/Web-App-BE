import { Router } from "express";
import {
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller";
import authGuard from "../middlewares/auth.guard";
import rolesGuard from "../middlewares/role.guard";

const router = Router();

// Any authenticated user can get patient details
router.get("/:id", authGuard, getPatientById);

// Only a user with the 'patient' role can update their own profile
router.put(
  "/:id",
  authGuard,
  rolesGuard(["patient"]),
  updatePatient,
);

// Only a user with the 'patient' role can delete their own profile
router.delete(
  "/:id",
  authGuard,
  rolesGuard(["patient"]),
  deletePatient,
);

export default router;
