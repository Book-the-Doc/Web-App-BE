import Patient from "../models/patient";
import Center from "../models/center";
import RefreshToken from "../models/refreshToken";
import jwt from "jsonwebtoken";
import { genSalt, hash, compare } from "bcrypt";
import { Request, Response } from "express";
import { TJwtPayload } from "../types/authTypes";

export const registerPatient = async (req: Request, res: Response) => {
  const { name, address, phone, email, dob, password } = req.body;

  try {
    let user = await Patient.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    user = new Patient({
      name,
      address,
      phone,
      email,
      password,
      dob,
    });

    const salt = await genSalt(10);
    user.password = await hash(password, salt);

    await user.save();

    res.json({ message: "Registation Success" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
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
    let user = await Center.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
    }

    user = new Center({
      name,
      email,
      medicalNumber,
      password,
      district,
      city,
      zipCode,
      phone,
    });

    const salt = await genSalt(10);
    user.password = await hash(password, salt);

    await user.save();

    res.json({ message: "Registation Success" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    let user = await Patient.findOne({ email });
    if (!user) {
      user = await Center.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "Invalid credentials1" });
        return;
      }
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials2" });
      return;
    }

    const payload: TJwtPayload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error(
        "Access token secret or refresh token secret not defined"
      );
    }

    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: "7d",
    });

    const refreshTokenDoc = new RefreshToken({
      token: refreshToken,
      userId: user.id,
    });
    await refreshTokenDoc.save();

    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: user.id,
      userRole: user.role,
      expiredAt: Date.now() + 3600000,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
    if (!refreshToken) {
      res.status(403).json({ message: "Access Denied" });
      return;
    }

    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      userId: userId,
      expires: { $gt: Date.now() },
    });
    if (!tokenDoc) {
      res.status(401).json({ message: "Invalid Token" });
      return;
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!accessTokenSecret) {
      throw new Error("Access token secret not defined");
    }
    if (!refreshTokenSecret) {
      throw new Error("Refresh token secret not defined");
    }

    const decoded = jwt.verify(refreshToken, refreshTokenSecret);

    if (
      decoded &&
      typeof decoded === "object" &&
      "user" in decoded &&
      typeof decoded.user === "object" &&
      "id" in decoded.user &&
      "role" in decoded.user
    ) {
      if (decoded.user.id !== userId) {
        res.status(401).json({ message: "Invalid Token" });
        return;
      } else {
        const payload: TJwtPayload = {
          user: {
            id: decoded.user.id,
            role: decoded.user.role,
          },
        };
        const newAccessToken = jwt.sign(payload, accessTokenSecret, {
          expiresIn: "10m",
        });

        res.json({
          accessToken: newAccessToken,
          refreshToken: refreshToken,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
