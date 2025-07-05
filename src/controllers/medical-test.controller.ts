import { RequestHandler } from "express";
import {
  createMedicalTestService,
  getMedicalTestByIdService,
} from "../services/medical-test.service";

export const createMedicalTest: RequestHandler = async (req, res) => {
  const centerId = req?.user?.id;
  const body = req.body;
  if (!centerId) {
    res.status(400).json({ message: "Center ID is required" });
    return;
  }
  try {
    const newMedicalTest = await createMedicalTestService(body, centerId);
    res.status(201).json(newMedicalTest);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// export const getMedicalTests = async (req: Request, res: Response) => {
//   const { centerId } = req.params;
//   try {
//     const medicalTests = await getMedicalTestsService(centerId);
//     res.status(200).json(medicalTests);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getMedicalTestById: RequestHandler = async (req, res) => {
  const { testId } = req.params;
  try {
    const medicalTest = await getMedicalTestByIdService(testId);
    if (!medicalTest) {
      res.status(404).json({ message: "Medical test not found" });
      return;
    }
    res.status(200).json(medicalTest);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
