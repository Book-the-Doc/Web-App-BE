export type TJwtUser = {
  id: string;
  role: TUserRole;
};

export type TJwtPayload = {
  user: TJwtUser;
};

export type TUserRole = "patient" | "center";

export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";

// This block merges our custom user type with Express's and Passport's User/Request types.
// It is the key to solving the type errors.
declare global {
  namespace Express {
    // This interface is used by passport and will be merged with the one from @types/passport.
    // It contains all possible properties from all authentication strategies.
    // Making them optional allows for different user object shapes.
    export interface User {
      id: string; // The only guaranteed property from both JWT and Google
      role?: TUserRole; // This comes from our JWT
      displayName?: string; // This comes from Google
      emails?: { value: string; verified: boolean }[]; // This comes from Google
      photos?: { value: string }[]; // This comes from Google
    }

    export interface Request {
      user?: User; // The user property is now correctly typed and optional on all requests
    }
  }
}
