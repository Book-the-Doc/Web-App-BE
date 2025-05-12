export type TJwtUser = {
  id: string;
  role: string;
};

export type TJwtPayload = {
  user: TJwtUser;
};

export type TRoles = "medicalCenter" | "patient";
