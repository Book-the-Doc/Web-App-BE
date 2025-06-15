import { Gender } from "./auth.type";

export type TUpdatePatientPayload = {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dob?: Date;
  phone?: string;
  bloodType?: string;
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  profilePicUrl?: string;
};
