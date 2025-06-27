import { TAppointmentType } from "../types/appointment.type";
import patientAppointment from "../models/patient-appointment";
import "../models/patient-appointment"; // Ensure model is registered with Mongoose
import DoctorSession from "../models/doctor-session";
import doctorSession from "../models/doctor-session";
import labSession from "../models/lab-session";

export const createAppointmentService = async ({
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
}: TAppointmentType) => {
  try {
    const newAppointment = new patientAppointment({
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

    const savedAppointment = await newAppointment.save();
    const sessionToUpdate = await DoctorSession.findById(session);
    if (!sessionToUpdate) {
      throw new Error("Session not found.");
    }
    sessionToUpdate.numberOfAppointments += 1;
    sessionToUpdate.appointments.push(savedAppointment._id);
    await sessionToUpdate.save();
    return savedAppointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

export const getAppointmentsBySessionIdService = async (sessionId: string) => {
  try {
    var session;
    session = await doctorSession.findById(sessionId).populate({
      path: "appointments",
      select: "token appointmentTime status notes patientName phone type",
    });
    if (!session) {
      session = await labSession.findById(sessionId).populate({
        path: "appointments",
        select: "token appointmentTime status notes patientName phone type",
      });
    }
    if (!session) {
      throw new Error("Session not found.");
    }
    return session.appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments.");
  }
};
