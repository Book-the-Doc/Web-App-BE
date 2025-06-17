import { TAppointmentType } from "../types/appointment.type";
import PatientAppointment from "../models/patient-appointment";
import DoctorSession from "../models/doctor-session";
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
    const newAppointment = new PatientAppointment({
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
    sessionToUpdate.ongoingNumber += 1;
    await sessionToUpdate.save();
    return savedAppointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};
