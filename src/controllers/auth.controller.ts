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
  logoutUserService,
} from "../services/auth.service";
import { Gender, TUserRole } from "../types/auth.type";

export const registerPatient = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    dob,
    password,
    googleId,
    phone,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    gender: Gender;
    dob: Date;
    password: string;
    googleId: string;
    phone: string;
  } = req.body;
  try {
    const result = await registerPatientService(
      firstName,
      lastName,
      email,
      gender,
      dob,
      password,
      googleId,
      phone,
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
    centerName,
    email,
    phone,
    password,
    googleId,
  }: {
    centerName: string;
    email: string;
    phone: string;
    password: string;
    googleId: string;
  } = req.body;
  try {
    const result = await registerCenterService(
      centerName,
      email,
      phone,
      password,
      googleId,
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
    const { userId, refreshToken } = req.body;
    await logoutUserService(userId, refreshToken);
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
  // Thanks to the global type augmentation, req.user is correctly typed
  const userProfile = req.user;

  // Check if passport returned a user profile
  if (!userProfile || !userProfile.emails || userProfile.emails.length === 0) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
    );
  }

  const userEmail = userProfile.emails[0].value;
  // The 'id' property on the user profile from Passport is the provider's unique ID
  const googleId = userProfile.id;

  try {
    // Check if a user with this Google ID already exists
    const googleUser = await getGoogleUserById(googleId);
    if (googleUser) {
      // User exists, log them in and create tokens
      const result = await createTokens(
        googleUser.id,
        googleUser.role as TUserRole,
      );
      const cookiePayload = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: googleUser.id,
        userRole: googleUser.role,
        expiredAt: new Date(Date.now() + 3600000), // 1 hour
      };
      res.cookie("session", JSON.stringify(cookiePayload), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600000,
      });
      return res.redirect(`${process.env.FRONTEND_URL!}/dashboard`);
    }

    // Check if a user with this email has a local account (non-Google)
    const existingUser = await getUserByEmail(userEmail);
    if (existingUser) {
      // A user with this email exists but it's not a Google account.
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=account-exists-with-email`,
      );
    }

    // If no user exists, redirect to registration page with Google info pre-filled
    res.redirect(
      `${process.env.FRONTEND_URL!}/register?googleId=${googleId}&email=${encodeURIComponent(userEmail)}`,
    );
  } catch (error) {
    console.error("Google auth callback error:", error);
    res
      .status(500)
      .redirect(`${process.env.FRONTEND_URL}/login?error=server-error`);
  }
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
    const emailResetToken = await createEmailResetToken(
      user._id,
      user.role as TUserRole,
    );
    await sendEmail(email, "Reset Password", "reset-password", {
      resetLink: `${process.env.FRONTEND_URL}/forgot-password/reset-password?token=${emailResetToken}`,
      name: (user as any).firstName || (user as any).centerName,
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
  const { token, newPassword } = req.body;
  try {
    const user = await validateEmailResetToken(token);
    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }
    await resetPasswordService(user._id, newPassword, user.role as TUserRole);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
