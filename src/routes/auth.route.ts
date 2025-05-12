import { Request, Response, Router } from "express";
import {
  loginUser,
  registerCenter,
  registerPatient,
  logoutUser,
  tokenRefresh,
  googleAuthCallback,
} from "../controllers/auth.controller";
import passport from "passport";
import "../config/passport";

const router = Router();

router.post("/register/patient", registerPatient);
router.post("/register/center", registerCenter);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", tokenRefresh);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: true,
  }),
  googleAuthCallback,
);

export default router;
