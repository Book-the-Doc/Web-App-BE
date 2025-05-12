import RefreshToken from "../models/refresh-token";
import { Request, Response } from "express";
import {
  createTokens,
  getGoogleUserById,
  getUserByEmail,
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

export const googleAuthCallback = async (req: Request, res: Response) => {
  const user = req.user as Express.User & {
    emails: { value: string; verified: boolean }[];
    displayName: string;
    id: string;
    photos?: { value: string }[];
  };
  const existingUser = await getUserByEmail(user.emails[0].value);
  if (existingUser) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=google-account-not-linked`,
    );
  }
  const googleUser = await getGoogleUserById(user.id);
  if (googleUser) {
    const result = await createTokens(googleUser.id, googleUser.role);
    const cookiePayload = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      userId: googleUser.id,
      userRole: googleUser.role,
      expiredAt: new Date(Date.now() + 3600000),
    };
    res.cookie("session", JSON.stringify(cookiePayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000,
    });
    return res.redirect(process.env.FRONTEND_URL!);
  }
  res.redirect(`${process.env.FRONTEND_URL!}/register?googleId=${user.id}`);
};
