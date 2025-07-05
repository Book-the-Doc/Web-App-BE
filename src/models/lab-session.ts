import { Schema, model, Document, Types } from "mongoose";
import { SessionStatus } from "../types/doctor.type";

interface ILabSession extends Document {
  _id: Types.ObjectId;
  center: Schema.Types.ObjectId;
  sessionDate: Date;
  sessionStartTime: string;
  sessionEndTime: string;
  numberOfAppointments: number;
  availableAppointments: number;
  ongoingNumber: number;
  status: SessionStatus;
  appointments: Types.ObjectId[];
  testDescription?: string;
  kind: "doctor" | "lab";
  technicianName?: string;
  testName: string;
  labRoom?: string;
  createdAt: Date;
  updatedAt: Date;
}

const labSessionSchema = new Schema<ILabSession>(
  {
    center: {
      type: Schema.Types.ObjectId,
      ref: "Center",
      required: true,
      index: true,
    },
    technicianName: {
      type: String,
      required: false,
      trim: true,
    },
    labRoom: {
      type: String,
      required: false,
      trim: true,
    },
    sessionDate: { type: Date, required: true },
    sessionStartTime: { type: String, required: true, trim: true },
    sessionEndTime: { type: String, required: true, trim: true },
    numberOfAppointments: { type: Number, required: true, min: 0 },
    availableAppointments: { type: Number, required: true, min: 1 },
    ongoingNumber: { type: Number, default: 0, required: true },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.NOT_STARTED,
      required: true,
    },
    appointments: [
      {
        type: Schema.Types.ObjectId,
        ref: "patientAppointment",
        required: true,
        default: [],
      },
    ],
    testDescription: { type: String, required: false, trim: true },
    kind: {
      type: String,
      enum: ["doctor", "lab"],
      required: true,
      default: "lab",
    },
    testName: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default model<ILabSession>("LabSession", labSessionSchema);
