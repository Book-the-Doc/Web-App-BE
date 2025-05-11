import { Request } from "express";
import { TJwtUser } from "../types/authTypes";

interface IRequestWithUser extends Request {
  user: TJwtUser;
}

export default IRequestWithUser;
