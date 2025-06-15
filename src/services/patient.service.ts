import Patient from "../models/patient";
import { TUpdatePatientPayload } from "../types/patient.type";

export const getPatientByIdService = async (id: string) => {
  return await Patient.findById(id).select("-password"); // Exclude password from the result
};

export const updatePatientService = async (
  id: string,
  payload: TUpdatePatientPayload,
) => {
  return await Patient.findByIdAndUpdate(id, payload, { new: true }).select(
    "-password",
  );
};

export const deletePatientService = async (id: string) => {
  return await Patient.findByIdAndDelete(id);
};
