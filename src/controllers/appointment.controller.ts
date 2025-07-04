import { Request, Response } from "express";
import { TAppointmentType } from "../types/appointment.type";
import {
  createAppointmentService,
  getAppointmentsBySessionIdService,
  getUserAppointmentsBySessionIdService,
} from "../services/appointment.service";

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
    // then this should update the sessions ongoingNumber by 1

    console.log("Creating appointment with data:", appointment);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create appointment", error });
  }
};

export const getAppointmentsBySessionId = async (
  req: Request,
  res: Response,
) => {
  const { sessionId } = req.params;
  try {
    const appointments = await getAppointmentsBySessionIdService(sessionId);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments", error });
  }
};

export const getUserAppointmentsBySessionId = async (
  req: Request,
  res: Response,
) => {
  const { sessionId, userId } = req.params;
  try {
    const appointments = await getUserAppointmentsBySessionIdService(
      sessionId,
      userId,
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user appointments", error });
  }
};
