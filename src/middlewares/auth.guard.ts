import { RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { TJwtPayload } from "../types/auth.type";

const authGuard: RequestHandler = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }
  if (authHeader.split(" ")[0] !== "Bearer") {
    res.status(401).json({ message: "Invalid token, authorization denied" });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }

  try {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
      throw new Error("Access token secret not defined");
    }
    const decoded = verify(token, accessTokenSecret) as TJwtPayload;
    if (typeof decoded !== "string" && "user" in decoded) {
      req.user = decoded.user;
    } else {
      throw new Error("Invalid token payload");
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authGuard;
