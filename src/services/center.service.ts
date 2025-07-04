import Center from "../models/center";
import doctorSession from "../models/doctor-session";
import labSession from "../models/lab-session";
import { TUpdateCenterPayload } from "../types/center.type";

/**
 * Fetches all centers from the database.
 * @returns An array of all center objects.
 */
export const getAllCentersService = async () => {
  return await Center.find().select("-password");
};

/**
 * Fetches a single center by its ID from the database.
 * @param id The ID of the center to fetch.
 * @returns The center object or null if not found.
 */
export const getCenterByIdService = async (id: string) => {
  // .select('-password') ensures the hashed password is not sent to the client.
  return await Center.findById(id).select("-password");
};

/**
 * Updates a center's information in the database.
 * @param id The ID of the center to update.
 * @param payload The data to update the center with.
 * @returns The updated center object.
 */
export const updateCenterService = async (
  id: string,
  payload: TUpdateCenterPayload,
) => {
  // { new: true } ensures the updated document is returned.
  return await Center.findByIdAndUpdate(id, payload, { new: true }).select(
    "-password",
  );
};

/**
 * Deletes a center from the database.
 * @param id The ID of the center to delete.
 * @returns The deleted center object.
 */
export const deleteCenterService = async (id: string) => {
  return await Center.findByIdAndDelete(id);
};

export const getSessionsByCenterIdService = async (centerId: string) => {
  const doctorSessions = await doctorSession
    .find({ center: centerId })
    .populate({
      path: "doctor",
      select: "_id doctorName specialty",
    });

  const doctorSessionsWithDetails = doctorSessions.map((session: any) => ({
    ...session.toObject(),
    doctorDetails: session.doctor
      ? {
          _id: session.doctor._id,
          doctorName: session.doctor.doctorName,
          specialty: session.doctor.specialty,
        }
      : null,
  }));
  const labSessions = await labSession.find({ center: centerId });

  return { doctorSessionsWithDetails, labSessions };
};
