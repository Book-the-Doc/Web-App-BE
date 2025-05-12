import { NextFunction, Response } from "express";
import { TRoles } from "../types/auth.type";
import IRequestWithUser from "../interfaces/request-with-user.interface";

const rolesGuard = (roles: TRoles) => {
  return (req: IRequestWithUser, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      console.log(req.user.role);
      return res.status(401).json({ message: "Access denied1234" });
    }
    next();
  };
};

export default rolesGuard;
