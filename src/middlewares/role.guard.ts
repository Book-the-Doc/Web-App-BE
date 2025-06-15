import { RequestHandler } from "express";
import { TUserRole } from "../types/auth.type";

const rolesGuard = (roles: TUserRole[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role as TUserRole)) {
      res.status(401).json({ message: "Access denied" });
      return;
    }
    next();
  };
};

export default rolesGuard;
