import { TAppointmentType } from "../types/appointment.type";
import PatientAppointment from "../models/patient-appointment";
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
    return savedAppointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};
