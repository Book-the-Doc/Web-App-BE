import { RequestHandler } from "express";
import {
  registerDoctorService,
  createDoctorSessionService,
  getAllDoctorsService,
  getDoctorByIdService,
  getDoctorsByCenterIdService,
  updateDoctorService,
  deleteDoctorService,
} from "../services/doctor.service";
import {
  TCreateSessionPayload,
  TRegisterDoctorPayload,
  TUpdateDoctorPayload,
} from "../types/doctor.type";

// --- Public Doctor Information Handlers ---

export const getAllDoctors: RequestHandler = async (req, res) => {
  try {
    const doctors = await getAllDoctorsService();
    res.status(200).json(doctors);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "An error occurred while retrieving doctors." });
  }
};

export const getDoctorById: RequestHandler = async (req, res) => {
  try {
    const doctor = await getDoctorByIdService(req.params.doctorId);
    if (!doctor) {
      res.status(404).json({ message: "Doctor not found." });
      return;
    }
    res.status(200).json(doctor);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "An error occurred while retrieving the doctor." });
  }
};

export const getDoctorsByCenter: RequestHandler = async (req, res) => {
  try {
    const doctors = await getDoctorsByCenterIdService(req.params.centerId);
    res.status(200).json(doctors);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

// --- Protected Center-Specific Handlers ---

export const registerDoctor: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }
  try {
    const newDoctor = await registerDoctorService(
      req.user.id,
      req.body as TRegisterDoctorPayload,
    );
    res.status(201).json(newDoctor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDoctor: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }
  try {
    const updatedDoctor = await updateDoctorService(
      req.user.id,
      req.params.doctorId,
      req.body as TUpdateDoctorPayload,
    );
    res.status(200).json(updatedDoctor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDoctor: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }
  try {
    const result = await deleteDoctorService(req.user.id, req.params.doctorId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createDoctorSession: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }
  try {
    const newSession = await createDoctorSessionService(
      req.user.id,
      req.body as TCreateSessionPayload,
    );
    res.status(201).json(newSession);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
