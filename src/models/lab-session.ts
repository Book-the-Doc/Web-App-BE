import { Schema, model, Document, Types } from "mongoose";
import { SessionStatus } from "../types/doctor.type";

interface ILabSession extends Document {
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
    numberOfAppointments: { type: Number, required: true, min: 1 },
    availableAppointments: { type: Number },
    ongoingNumber: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.NOT_STARTED,
    },
    appointments: [{ type: Schema.Types.ObjectId, ref: "patientAppointment" }],
    testDescription: { type: String, required: false, trim: true },
    kind: {
      type: String,
      enum: ["doctor", "lab"],
      required: false,
      default: "doctor",
    },
    testName: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

// Middleware to set availableAppointments equal to numberOfAppointments when a new session is created
labSessionSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableAppointments = this.numberOfAppointments;
  }
  next();
});

export default model<ILabSession>("LabSession", labSessionSchema);
