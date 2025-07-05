import { Types } from "mongoose";
import medicalTest from "../models/medical-test";
import { addMedicalTestToCenterService } from "./center.service";

export const createMedicalTestService = async (body: any, centerId: string) => {
  try {
    const newMedicalTest = new medicalTest(body);
    await newMedicalTest.save();
    await addMedicalTestToCenterService(centerId, newMedicalTest._id);
    return newMedicalTest;
  } catch (error) {
    console.error("Error creating medical test:", error);
    throw new Error("Failed to create medical test.");
  }
};

export const getMedicalTestsService = async (centerId: string) => {
  try {
    const medicalTests = await medicalTest.find({ center: centerId });
    return medicalTests;
  } catch (error) {
    console.error("Error fetching medical tests:", error);
    throw new Error("Failed to fetch medical tests.");
  }
};
export const getMedicalTestByIdService = async (testId: string) => {
  try {
    const medicalTestData = await medicalTest.findById(testId);
    return medicalTestData;
  } catch (error) {
    console.error("Error fetching medical test by ID:", error);
    throw new Error("Failed to fetch medical test by ID.");
  }
};

export const addLabSessionToMedicalTestService = async (
  medicalTestId: string,
  sessionId: Types.ObjectId,
) => {
  try {
    const test = await medicalTest.findById(medicalTestId);
    if (!test) {
      throw new Error("medicalTest not found");
    }
    if (test.sessions.includes(sessionId)) {
      throw new Error("Session already exists in the medicalTest");
    }
    test.sessions.push(sessionId);
    await test.save();
    return test;
  } catch (error) {
    console.error("Error adding medical test to center:", error);
    throw new Error("Failed to add medical test to center.");
  }
};
