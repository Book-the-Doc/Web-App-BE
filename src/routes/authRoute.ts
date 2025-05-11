import { Request, Response, Router } from "express";
import {
  loginUser,
  registerCenter,
  registerPatient,
  logoutUser,
  tokenRefresh,
} from "../controllers/authController";

const router = Router();

router.post("/register/patient", registerPatient);
router.post("/register/center", registerCenter);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", tokenRefresh);

export default router;
