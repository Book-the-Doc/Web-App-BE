import { Request, Response } from "express";
import {
  createDoctorSessionService,
  createLabSessionService,
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
  const body = req.body;
  try {
    const newSession = await createLabSessionService(body);
    res.status(201).json(newSession);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
