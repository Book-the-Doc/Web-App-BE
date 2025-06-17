import { Router } from "express";
import {
  registerDoctor,
  createDoctorSession,
  getAllDoctors,
  getDoctorById,
  getDoctorsByCenter,
  updateDoctor,
  deleteDoctor,
  getSessionsByDoctorId,
} from "../controllers/doctor.controller";
import authGuard from "../middlewares/auth.guard";
import rolesGuard from "../middlewares/role.guard";

const router = Router();

// --- PUBLIC ROUTES ---
// Get all doctors in the system
router.get("/", getAllDoctors);

// Get a specific doctor by their ID
router.get("/:doctorId", getDoctorById);

// Get all doctors associated with a specific center
router.get("/center/:centerId", getDoctorsByCenter);

// --- PROTECTED CENTER ROUTES ---
// Register a new doctor under the currently logged-in center
router.post("/register", authGuard, rolesGuard(["center"]), registerDoctor);

// Create a new session for a doctor at the currently logged-in center
router.post("/session", authGuard, rolesGuard(["center"]), createDoctorSession);

// Get doctor sessions by doctor ID
router.get("/session/:doctorId", authGuard, getSessionsByDoctorId);

// Update a doctor's details (center must be associated with the doctor)
router.put("/:doctorId", authGuard, rolesGuard(["center"]), updateDoctor);

// Delete a doctor's association from the logged-in center
router.delete("/:doctorId", authGuard, rolesGuard(["center"]), deleteDoctor);

export default router;
