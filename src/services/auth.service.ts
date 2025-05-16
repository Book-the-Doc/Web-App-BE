import Patient from "../models/patient";
import Center from "../models/center";
import RefreshToken from "../models/refresh-token";
import jwt from "jsonwebtoken";
import { Gender, TJwtPayload, TRoles } from "../types/auth.type";
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
    user_id: userId,
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
  google_id: string,
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
    google_id,
    gender,
    emergency_contact_relation,
    emergency_contact_name,
    emergency_contact_phone,
  });
  await newUser.save();
  if (google_id) {
    return createTokens(newUser.id, newUser.role);
  }

  return { message: "Registration Success" };
};

export const registerCenterService = async (
  email: string,
  password: string,
  phone: string,
  center_name: string,
  address?: string,
  geo_location?: {
    lat: number;
    lng: number;
  },
  web_site_url?: string,
  image_url?: string,
  google_id?: string,
) => {
  const existingUser = await Center.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);
  const newUser = new Center({
    email,
    password: password !== "" ? hashedPassword : "",
    phone,
    center_name,
    address,
    geo_location,
    web_site_url,
    image_url,
    google_id,
  });
  await newUser.save();
  if (google_id) {
    return createTokens(newUser.id, newUser.role);
  }
  return { message: "Registration Success" };
};

export const getUserByEmail = async (email: string) => {
  const patient = await Patient.findOne({ email, google_id: null });
  let center = null;
  if (!patient) {
    center = await Center.findOne({ email, google_id: null });
  }
  return patient || center;
};

export const getGoogleUserById = async (googleId: string) => {
  const patient = await Patient.findOne({ google_id: googleId });
  let center = null;
  if (!patient) {
    center = await Center.findOne({ google_id: googleId });
  }
  return patient || center;
};

export const createTokens = async (id: string, role: TRoles) => {
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
    user_id: id,
    user_type: role,
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
  userRole: TRoles,
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
        email_reset_token: resetToken,
        email_reset_token_expired: Date.now() + 15 * 60 * 1000,
      },
    );
  } else {
    await Center.updateOne(
      { _id: userId },
      {
        email_reset_token: resetToken,
        email_reset_token_expired: Date.now() + 15 * 60 * 1000,
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
      email_reset_token: token,
      email_reset_token_expired: { $gt: Date.now() },
    });
  } else {
    user = await Center.findOne({
      _id: userId,
      email_reset_token: token,
      email_reset_token_expired: { $gt: Date.now() },
    });
  }
  return user;
};

export const resetPasswordService = async (
  userId: object,
  newPassword: string,
  userRole: TRoles,
) => {
  const salt = await genSalt(10);
  const hashedPassword = await hash(newPassword, salt);
  if (userRole === "patient") {
    await Patient.updateOne(
      { _id: userId },
      {
        password: hashedPassword,
        email_reset_token: null,
        email_reset_token_expired: null,
      },
    );
  } else {
    await Center.updateOne(
      { _id: userId },
      {
        password: hashedPassword,
        email_reset_token: null,
        email_reset_token_expired: null,
      },
    );
  }
};
