import { Request, Response } from "express";
import {
  createDoctorSessionService,
  createLabSessionService,
  getLabSessionsByIdsService,
} from "../services/session.service";

export const createDoctorSession = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const newSession = await createDoctorSessionService(body);
    res.status(201).json(newSession);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createLabSession = async (req: Request, res: Response) => {
  const { session, testId } = req.body;
  const centerId = req?.user?.id;
  if (!centerId) {
    res.status(400).json({ message: "Center ID is required" });
    return;
  }
  try {
    const newSession = await createLabSessionService(session, centerId, testId);
    res.status(201).json(newSession);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getLabSessionsByIds = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const labSessions = await getLabSessionsByIdsService(ids);
    res.status(200).json(labSessions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
