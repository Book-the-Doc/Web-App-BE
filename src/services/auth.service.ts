import Patient from "../models/patient";
import Center from "../models/center";
import RefreshToken from "../models/refresh-token";
import jwt from "jsonwebtoken";
import { Gender, TJwtPayload } from "../types/auth.type";
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

  return createTokens(user.id, user.role);
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
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  phone: string,
  date_of_birth: Date,
  blood_type: string,
  googleId: string,
  gender: Gender,
  emergency_contact_relation: string,
  emergency_contact_name: string,
  emergency_contact_phone: string,
) => {
  const existingUser = await Patient.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  const newUser = new Patient({
    email,
    password: password !== "" ? hashedPassword : "",
    first_name,
    last_name,
    phone,
    date_of_birth,
    blood_type,
    googleId,
    gender,
    emergency_contact_relation,
    emergency_contact_name,
    emergency_contact_phone,
  });
  await newUser.save();
  if (googleId) {
    return createTokens(newUser.id, newUser.role);
  }

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

export const getUserByEmail = async (email: string) => {
  const patient = await Patient.findOne({ email, googleId: null });
  let center = null;
  if (!patient) {
    center = await Center.findOne({ email, googleId: null });
  }
  return patient || center;
};

export const getGoogleUserById = async (googleId: string) => {
  const patient = await Patient.findOne({ googleId });
  let center = null;
  if (!patient) {
    center = await Center.findOne({ googleId });
  }
  return patient || center;
};

export const createTokens = async (id: string, role: string) => {
  const payload: TJwtPayload = {
    user: {
      id,
      role,
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
    userId: id,
  });
  await refreshTokenDoc.save();

  return {
    accessToken,
    refreshToken,
    userId: id,
    userRole: role,
    expiredAt: new Date(Date.now() + 3600000),
  };
};
