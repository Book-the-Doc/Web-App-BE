import { Router } from "express";
import {
  getAllCenters,
  getCenterById,
  updateCenter,
  deleteCenter,
  getSessions,
  getCenterMedicalTests,
} from "../controllers/center.controller";
import authGuard from "../middlewares/auth.guard";
import rolesGuard from "../middlewares/role.guard";

const router = Router();

// Endpoint to get all centers' public information. No authentication required.
router.get("/", getAllCenters);

// Endpoint to get a center's public information. No authentication required.
router.get("/:id", getCenterById);

// Endpoint for a center to update its own profile.
// Requires authentication and the user must have the 'center' role.
router.put("/:id", authGuard, rolesGuard(["center"]), updateCenter);

// Endpoint for a center to delete its own profile.
// Requires authentication and the user must have the 'center' role.
router.delete("/:id", authGuard, rolesGuard(["center"]), deleteCenter);

// get all sessions that related to the center

router.get(
  "/sessions/:centerId",
  authGuard,
  rolesGuard(["center"]),
  getSessions,
);
router.get("/getAllTests/:centerId", getCenterMedicalTests);

export default router;
