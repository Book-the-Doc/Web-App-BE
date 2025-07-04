import { TAppointmentType } from "../types/appointment.type";
import patientAppointment from "../models/patient-appointment";
import "../models/patient-appointment";
import DoctorSession from "../models/doctor-session";
import doctorSession from "../models/doctor-session";
import labSession from "../models/lab-session";
import Center from "../models/center";

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

export const getUserAppointmentsBySessionIdService = async (
  sessionId: string,
  userId: string,
) => {
  try {
    const appointments = await patientAppointment
      .find({
        session: sessionId,
        patient: userId,
      })
      .populate({
        path: "doctor",
        select: "doctorName specialty",
        model: "Doctor",
      })
      .populate({
        path: "center",
        select: "centerName",
        model: Center,
      });
    return appointments.map((appointment) => {
      const doctor: any = appointment.doctor;
      return {
        ...appointment.toObject(),
        doctorDetails:
          doctor && typeof doctor === "object"
            ? {
                _id: doctor._id,
                doctorName: doctor.doctorName,
                specialty: doctor.specialty,
              }
            : {
                _id: doctor,
                doctorName: undefined,
                specialty: undefined,
              },
        doctor: doctor?._id,
        center:
          appointment.center &&
          typeof appointment.center === "object" &&
          "centerName" in appointment.center
            ? (appointment.center as any).centerName
            : appointment.center,
      };
    });
  } catch (error: any) {
    console.error("Error fetching user appointments:", error);
    throw new Error("Failed to fetch user appointments.");
  }
};
