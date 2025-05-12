import Patient from "../models/patient";
import Center from "../models/center";
import RefreshToken from "../models/refresh-token";
import jwt from "jsonwebtoken";
import { TJwtPayload } from "../types/auth.type";
import { genSalt, hash, compare } from "bcrypt";

export const loginUserService = async (email: string, password: string) => {
  let user = await Patient.findOne({ email });
  if (!user) {
    user = await Center.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }
  }

  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
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
    throw new Error("Access token secret or refresh token secret not defined");
  }

  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "1m",
  });

  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "7d",
  });

  const refreshTokenDoc = new RefreshToken({
    token: refreshToken,
    userId: user.id,
  });
  await refreshTokenDoc.save();

  return {
    accessToken,
    refreshToken,
    userId: user.id,
    userRole: user.role,
    expiredAt: new Date(Date.now() + 3600000),
  };
};

export const refreshAccessTokenService = async (
  refreshToken: string,
  userId: string,
) => {
  if (!refreshToken) {
    throw new Error("Access Denied");
  }

  const tokenDoc = await RefreshToken.findOne({
    token: refreshToken,
    userId: userId,
    expires: { $gt: Date.now() },
  });

  if (!tokenDoc) {
    throw new Error("Invalid Token");
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
    !decoded ||
    typeof decoded !== "object" ||
    !("user" in decoded) ||
    typeof decoded.user !== "object" ||
    !("id" in decoded.user) ||
    !("role" in decoded.user)
  ) {
    throw new Error("Invalid Token");
  }

  if (decoded.user.id !== userId) {
    throw new Error("Invalid Token");
  }

  const payload: TJwtPayload = {
    user: {
      id: decoded.user.id,
      role: decoded.user.role,
    },
  };

  const newAccessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "10m",
  });

  return {
    accessToken: newAccessToken,
    refreshToken: refreshToken,
  };
};

export const registerPatientService = async (
  name: string,
  address: string,
  phone: string,
  email: string,
  dob: string,
  password: string,
) => {
  const existingUser = await Patient.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  const newUser = new Patient({
    name,
    address,
    phone,
    email,
    password: hashedPassword,
    dob,
  });

  await newUser.save();

  return { message: "Registration Success" };
};

export const registerCenterService = async (
  name: string,
  email: string,
  medicalNumber: string,
  password: string,
  district: string,
  city: string,
  zipCode: string,
  phone: string,
) => {
  const existingUser = await Center.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  const newUser = new Center({
    name,
    email,
    medicalNumber,
    password: hashedPassword,
    district,
    city,
    zipCode,
    phone,
  });
  await newUser.save();
  return { message: "Registration Success" };
};
