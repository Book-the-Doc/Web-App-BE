import { Schema, model } from "mongoose";
import { MedicalSpecialty } from "../types/doctor.type";

/**
 * @description Represents a doctor in the system.
 */
const doctorSchema = new Schema(
  {
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    slmcNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    specialty: {
      type: String,
      enum: Object.values(MedicalSpecialty),
      required: false,
    },
    medicalCenters: [
      {
        type: Schema.Types.ObjectId,
        ref: "Center",
      },
    ],
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: "DoctorSession",
      },
    ],
    contactNumber: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true },
);

export default model("Doctor", doctorSchema);
