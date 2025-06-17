import Doctor from "../models/doctor";
import Center from "../models/center";
import DoctorSession from "../models/doctor-session";
import {
  TCreateSessionPayload,
  TRegisterDoctorPayload,
  TUpdateDoctorPayload,
} from "../types/doctor.type";
import mongoose from "mongoose";

// --- Doctor Management Services ---

/**
 * Retrieves all doctors from the database.
 * @returns A list of all doctors with their associated center names.
 */
export const getAllDoctorsService = async () => {
  return Doctor.find().populate("doctorName");
};

/**
 * Retrieves a single doctor by their ID.
 * @param doctorId The ID of the doctor to retrieve.
 * @returns A single doctor object or null if not found.
 */
export const getDoctorByIdService = async (doctorId: string) => {
  return Doctor.findById(doctorId).populate("doctorName");
};

/**
 * Retrieves all doctors associated with a specific medical center.
 * @param centerId The ID of the center.
 * @returns A list of doctors registered under that center.
 */
export const getDoctorsByCenterIdService = async (centerId: string) => {
  const center = await Center.findById(centerId).populate({
    path: "doctors",
    select: "doctorName specialty contactNumber",
  });
  if (!center) {
    throw new Error("Center not found.");
  }
  return center.doctors;
};

/**
 * Registers a new doctor and associates them with the registering center.
 * @param centerId The ID of the center registering the doctor.
 * @param payload The doctor's registration details.
 * @returns The newly created doctor object.
 */
export const registerDoctorService = async (
  centerId: string,
  payload: TRegisterDoctorPayload,
) => {
  const existingDoctor = await Doctor.findOne({
    slmcNumber: payload.slmcNumber,
  });
  if (existingDoctor) {
    throw new Error("A doctor with this SLMC number already exists.");
  }
  const newDoctor = new Doctor({ ...payload, medicalCenters: [centerId] });
  await newDoctor.save();
  await Center.findByIdAndUpdate(centerId, {
    $push: { doctors: newDoctor._id },
  });
  return newDoctor;
};

/**
 * Updates a doctor's information, but only if the requesting center is authorized.
 * @param centerId The ID of the center making the request.
 * @param doctorId The ID of the doctor to update.
 * @param payload The data to update.
 * @returns The updated doctor object.
 */
export const updateDoctorService = async (
  centerId: string,
  doctorId: string,
  payload: TUpdateDoctorPayload,
) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new Error("Doctor not found.");
  }
  // Security check: Only a center listed in the doctor's profile can update them.
  if (!doctor.medicalCenters.includes(centerId as any)) {
    throw new Error("You are not authorized to update this doctor.");
  }
  return Doctor.findByIdAndUpdate(doctorId, payload, { new: true });
};

/**
 * Deletes a doctor's association with a center. If the doctor has no more centers,
 * their entire record and all associated sessions are deleted.
 * @param centerId The ID of the center making the request.
 * @param doctorId The ID of the doctor to delete/disassociate.
 * @returns A success message.
 */
export const deleteDoctorService = async (
  centerId: string,
  doctorId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const doctor = await Doctor.findById(doctorId).session(session);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }
    if (!doctor.medicalCenters.includes(centerId as any)) {
      throw new Error(
        "You are not authorized to delete this doctor from your center.",
      );
    }

    // Remove doctor from the center's list of doctors
    await Center.findByIdAndUpdate(
      centerId,
      { $pull: { doctors: doctorId } },
      { session },
    );

    // Remove the center from the doctor's list of medical centers
    await doctor.updateOne(
      { $pull: { medicalCenters: centerId } },
      { session },
    );

    // Reload the doctor to check the updated state of medicalCenters
    const updatedDoctor = await Doctor.findById(doctorId).session(session);

    // If the doctor has no more associated centers, they are an "orphan" and should be deleted.
    if (updatedDoctor && updatedDoctor.medicalCenters.length === 0) {
      // Delete all sessions associated with this doctor
      await DoctorSession.deleteMany({ doctor: doctorId }, { session });
      // Delete the doctor document itself
      await Doctor.findByIdAndDelete(doctorId, { session });
    }

    await session.commitTransaction();
    return { message: "Doctor has been successfully removed from the center." };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// --- Session Management Service ---

/**
 * Creates a new channeling session for a doctor.
 * @param centerId The ID of the center where the session will be held.
 * @param payload The details for the new session.
 * @returns The newly created session object.
 */
export const createDoctorSessionService = async (
  centerId: string,
  payload: TCreateSessionPayload,
) => {
  const { doctorId, ...sessionDetails } = payload;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found.");
  if (!doctor.medicalCenters.includes(centerId as any))
    throw new Error("This doctor is not associated with your center.");

  const newSession = new DoctorSession({
    ...sessionDetails,
    doctor: doctorId,
    center: centerId,
  });
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();
  try {
    await newSession.save({ session: mongoSession });
    await Doctor.findByIdAndUpdate(
      doctorId,
      { $push: { sessions: newSession._id } },
      { session: mongoSession },
    );
    await Center.findByIdAndUpdate(
      centerId,
      { $push: { sessions: newSession._id } },
      { session: mongoSession },
    );
    await mongoSession.commitTransaction();
    return newSession;
  } catch (error) {
    await mongoSession.abortTransaction();
    throw new Error("Failed to create session. Please try again.");
  } finally {
    mongoSession.endSession();
  }
};

export const getSessionsByDoctorIdService = async (doctorId: string) => {
  const sessions = await DoctorSession.find({ doctor: doctorId });
  if (!sessions) {
    throw new Error("Doctor not found.");
  }
  return sessions;
};
