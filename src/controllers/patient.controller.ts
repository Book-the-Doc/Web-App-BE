import { RequestHandler } from "express";
import {
  deletePatientService,
  getPatientByIdService,
  updatePatientService,
} from "../services/patient.service";
import { TUpdatePatientPayload } from "../types/patient.type";

export const getPatientById: RequestHandler = async (req, res) => {
    
  try {
    const patient = await getPatientByIdService(req.params.id);
    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePatient: RequestHandler = async (req, res) => {
  try {
    // Security check: ensure the logged-in user can only update their own profile.
    if (req.user?.id !== req.params.id) {
      res.status(403).json({ message: "Forbidden: You can only update your own profile." });
      return;
    }

    const patient = await updatePatientService(
      req.params.id,
      req.body as TUpdatePatientPayload,
    );
    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePatient: RequestHandler = async (req, res) => {
  try {
    // Security check: ensure the logged-in user can only delete their own profile.
    if (req.user?.id !== req.params.id) {
        res.status(403).json({ message: "Forbidden: You can only delete your own profile." });
        return;
    }

    const patient = await deletePatientService(req.params.id);
    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }
    res.json({ message: "Patient deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
