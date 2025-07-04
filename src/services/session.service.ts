import doctorSession from "../models/doctor-session";
import labSession from "../models/lab-session";

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

export const createLabSessionService = async (body: any) => {
  try {
    const newSession = new labSession(body);
    const newses = await newSession.save();
    console.log("New lab session created:", newses);
    return newses;
  } catch (error) {
    console.error("Error creating lab session:", error);
    throw new Error("Failed to create lab session.");
  }
};
