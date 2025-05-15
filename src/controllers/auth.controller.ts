import RefreshToken from "../models/refresh-token";
import { Request, Response } from "express";
import {
  createEmailResetToken,
  createTokens,
  getGoogleUserById,
  getUserByEmail,
  loginUserService,
  refreshAccessTokenService,
  registerCenterService,
  registerPatientService,
  resetPasswordService,
  sendEmail,
  validateEmailResetToken,
} from "../services/auth.service";

export const registerPatient = async (req: Request, res: Response) => {
  const {
    email,
    password,
    first_name,
    last_name,
    phone,
    date_of_birth,
    blood_type,
    google_id,
    gender,
    emergency_contact_relation,
    emergency_contact_name,
    emergency_contact_phone,
  } = req.body;
  try {
    const result = await registerPatientService(
      email,
      password,
      first_name,
      last_name,
      phone,
      date_of_birth,
      blood_type,
      google_id,
      gender,
      emergency_contact_relation,
      emergency_contact_name,
      emergency_contact_phone,
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
    center_name,
    address,
    geo_location,
    web_site_url,
    image_url,
    password,
    google_id,
    email,
    phone,
  }: {
    center_name: string;
    address: string;
    geo_location?: {
      lat: number;
      lng: number;
    };
    web_site_url?: string;
    image_url?: string;
    password: string;
    google_id?: string;
    email: string;
    phone: string;
  } = req.body;
  try {
    const result = await registerCenterService(
      email,
      password,
      phone,
      center_name,
      address,
      geo_location,
      web_site_url,
      image_url,
      google_id,
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
    return res.redirect(`${process.env.FRONTEND_URL!}/dashboard`);
  }
  res.redirect(
    `${process.env.FRONTEND_URL!}/register?googleId=${user.id}&email=${encodeURIComponent(user.emails[0].value)}`,
  );
};

export const forgotPasswordEmailCheck = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const emailResetToken = await createEmailResetToken(user._id, user.role);
    await sendEmail(email, "Reset Password", "reset-password", {
      resetLink: `${process.env.FRONTEND_URL}/forgot-password/reset-password?token=${emailResetToken}`,
      name: (user as any).first_name || (user as any).center_name,
    });
    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token, newPassword, forgotPasswordEmail } = req.body;
  try {
    const user = await validateEmailResetToken(token, forgotPasswordEmail);
    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }
    await resetPasswordService(user._id, newPassword, user.role);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
