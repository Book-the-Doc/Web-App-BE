export type TJwtUser = {
  id: string;
  role: string;
};

export type TJwtPayload = {
  user: TJwtUser;
};

export type TUserRole = "patient" | "center";

export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";
