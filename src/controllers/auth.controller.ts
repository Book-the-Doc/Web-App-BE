import RefreshToken from "../models/refresh-token";
import { Request, Response } from "express";
import {
  loginUserService,
  refreshAccessTokenService,
  registerCenterService,
  registerPatientService,
} from "../services/auth.service";

export const registerPatient = async (req: Request, res: Response) => {
  const { name, address, phone, email, dob, password } = req.body;

  try {
    const result = await registerPatientService(
      name,
      address,
      phone,
      email,
      dob,
      password,
    );
    res.json(result);
  } catch (error: any) {
    const message = error.message || "Server error";
    const status = message === "User already exists" ? 400 : 500;
    res.status(status).json({ message });
  }
};

export const registerCenter = async (req: Request, res: Response) => {
  const {
    name,
    email,
    medicalNumber,
    password,
    district,
    city,
    zipCode,
    phone,
  } = req.body;

  try {
    const result = await registerCenterService(
      name,
      email,
      medicalNumber,
      password,
      district,
      city,
      zipCode,
      phone,
    );
    res.json(result);
  } catch (error: any) {
    const message = error.message || "Server error";
    const status = message === "User already exists" ? 400 : 500;
    res.status(status).json({ message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await loginUserService(email, password);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Invalid credentials") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    res.json({ message: "Logout Success" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const tokenRefresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken, userId } = req.body;
    const result = await refreshAccessTokenService(refreshToken, userId);
    res.json(result);
  } catch (error: any) {
    const message = error.message || "Server error";
    const status =
      message === "Access Denied"
        ? 403
        : message === "Invalid Token"
          ? 401
          : 500;
    res.status(status).json({ message });
  }
};

export const googleAuthCallback = (req: Request, res: Response) => {
  // You can access the authenticated user with req.user
  // You can also issue JWTs here if needed

  // Example: res.json(req.user); or redirect
  res.redirect(process.env.FRONTEND_URL!);
};
