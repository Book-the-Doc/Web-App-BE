import Patient from "../models/patient";
import Center from "../models/center";
import RefreshToken from "../models/refresh-token";
import jwt from "jsonwebtoken";
import { Gender, TJwtPayload, TUserRole } from "../types/auth.type";
import { genSalt, hash, compare } from "bcrypt";
import transporter from "../config/mail-transporter";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

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
  firstName: string,
  lastName: string,
  email: string,
  gender: Gender,
  dob: Date,
  password: string,
  googleId?: string,
) => {
  const existingUser = await Patient.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  const newUser = new Patient({
    firstName,
    lastName,
    email,
    gender,
    dob,
    password: password !== "" ? hashedPassword : "",
    googleId,
  });
  await newUser.save();
  if (googleId) {
    return createTokens(newUser.id, newUser.role);
  }

  return { message: "Registration Success" };
};

export const registerCenterService = async (
  centerName: string,
  email: string,
  phone: string,
  password: string,
  googleId?: string,
) => {
  const existingUser = await Center.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  const newUser = new Center({
    centerName,
    email,
    phone,
    password: password !== "" ? hashedPassword : "",
    googleId,
  });
  await newUser.save();
  if (googleId) {
    return createTokens(newUser.id, newUser.role);
  }
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
  const patient = await Patient.findOne({ googleId: googleId });
  let center = null;
  if (!patient) {
    center = await Center.findOne({ googleId: googleId });
  }
  return patient || center;
};

export const createTokens = async (id: string, role: TUserRole) => {
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
    userType: role,
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

export const sendEmail = async (
  email: string,
  subject: string,
  templateName: string,
  context: object,
) => {
  const templatePath = path.resolve(`./src/templates/${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(source);
  const mailOptions = {
    from: "Book the Doc <service.book_the_doc@gmail.com>",
    to: email,
    subject,
    html: template(context),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export const createEmailResetToken = async (
  userId: object,
  userRole: TUserRole,
) => {
  const resetToken = jwt.sign(
    { userId, userRole },
    process.env.RESET_EMAIL_TOKEN_SECRET as string,
    { expiresIn: "15m" },
  );
  if (userRole === "patient") {
    await Patient.updateOne(
      { _id: userId },
      {
        emailResetToken: resetToken,
        emailResetTokenExpired: Date.now() + 15 * 60 * 1000,
      },
    );
  } else {
    await Center.updateOne(
      { _id: userId },
      {
        emailResetToken: resetToken,
        emailResetTokenExpired: Date.now() + 15 * 60 * 1000,
      },
    );
  }
  return resetToken;
};

export const validateEmailResetToken = async (token: string) => {
  const decoded = jwt.verify(
    token,
    process.env.RESET_EMAIL_TOKEN_SECRET as string,
  );
  if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
    throw new Error("Invalid or expired token");
  }
  const userId = decoded.userId;
  const userRole = decoded.userRole;
  let user;
  if (userRole === "patient") {
    user = await Patient.findOne({
      _id: userId,
      emailResetToken: token,
      emailResetTokenExpired: { $gt: Date.now() },
    });
  } else {
    user = await Center.findOne({
      _id: userId,
      emailResetToken: token,
      emailResetTokenExpired: { $gt: Date.now() },
    });
  }
  return user;
};

export const resetPasswordService = async (
  userId: object,
  newPassword: string,
  userRole: TUserRole,
) => {
  const salt = await genSalt(10);
  const hashedPassword = await hash(newPassword, salt);
  if (userRole === "patient") {
    await Patient.updateOne(
      { _id: userId },
      {
        password: hashedPassword,
        emailResetToken: null,
        emailResetTokenExpired: null,
      },
    );
  } else {
    await Center.updateOne(
      { _id: userId },
      {
        password: hashedPassword,
        emailResetToken: null,
        emailResetTokenExpired: null,
      },
    );
  }
};
