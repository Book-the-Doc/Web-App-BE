import { Request, Response } from "express";
import { TAppointmentType } from "../types/appointment.type";
import { createAppointmentService } from "../services/appointment.service";

export const createAppointment = async (req: Request, res: Response) => {
  const {
    doctor,
    patient,
    center,
    session,
    token,
    appointmentTime,
    status,
    notes,
    patientName,
    phone,
  }: TAppointmentType = req.body;

  try {
    const appointment = await createAppointmentService({
      doctor,
      patient,
      center,
      session,
      token,
      appointmentTime,
      status,
      notes,
      patientName,
      phone,
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create appointment", error });
  }
};
