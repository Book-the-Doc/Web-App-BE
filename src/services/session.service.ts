import { on } from "events";
import doctorSession from "../models/doctor-session";
import labSession from "../models/lab-session";
import { addLabSessionToMedicalTestService } from "./medical-test.service";

export const createDoctorSessionService = async (body: any) => {
  try {
    const newSession = new doctorSession(body);
    await newSession.save();
    return newSession;
  } catch (error) {
    console.error("Error creating doctor session:", error);
    throw new Error("Failed to create doctor session.");
  }
};

export const createLabSessionService = async (
  body: any,
  centerId: string,
  testId: string,
) => {
  try {
    const newSession = new labSession({ ...body, center: centerId });
    await newSession.save();
    await addLabSessionToMedicalTestService(testId, newSession._id);
    return newSession;
  } catch (error) {
    console.error("Error creating lab session:", error);
    throw new Error("Failed to create lab session.");
  }
};

export const getLabSessionsByIdsService = async (ids: string[]) => {
  try {
    const labSessions = await labSession.find({ _id: { $in: ids } });
    return labSessions;
  } catch (error) {
    console.error("Error fetching lab sessions by IDs:", error);
    throw new Error("Failed to fetch lab sessions by IDs.");
  }
};
