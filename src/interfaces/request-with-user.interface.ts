import { Request } from "express";
import { TJwtUser } from "../types/auth.type";

interface IRequestWithUser extends Request {
  user: TJwtUser;
}

export default IRequestWithUser;
