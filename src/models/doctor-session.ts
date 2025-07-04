import { Schema, model, Document, Types } from "mongoose";
import { RecurringFrequency, SessionStatus } from "../types/doctor.type";

interface IDoctorSession extends Document {
  doctor: Schema.Types.ObjectId;
  center: Schema.Types.ObjectId;
  sessionDate: Date;
  sessionStartTime: string;
  sessionEndTime: string;
  recurring: boolean;
  recurringFrequency?: RecurringFrequency;
  customRecurringDays?: string[];
  numberOfAppointments: number;
  availableAppointments: number;
  ongoingNumber: number;
  status: SessionStatus;
  appointments: Types.ObjectId[];
  notes?: string;
  kind: string;
}

const doctorSessionSchema = new Schema<IDoctorSession>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    center: {
      type: Schema.Types.ObjectId,
      ref: "Center",
      required: true,
      index: true,
    },
    sessionDate: { type: Date, required: true },
    sessionStartTime: { type: String, required: true, trim: true },
    sessionEndTime: { type: String, required: true, trim: true },
    recurring: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: Object.values(RecurringFrequency),
      required: function (this: IDoctorSession) {
        return this.recurring;
      },
    },
    customRecurringDays: {
      type: [String],
      required: function (this: IDoctorSession) {
        return this.recurringFrequency === RecurringFrequency.CUSTOM;
      },
    },
    numberOfAppointments: { type: Number, required: true, min: 0 },
    availableAppointments: { type: Number, min: 1, required: true },
    ongoingNumber: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.NOT_STARTED,
    },
    appointments: [{ type: Schema.Types.ObjectId, ref: "patientAppointment" }],
    notes: { type: String, required: false, trim: true },
    kind: {
      type: String,
      enum: ["doctor", "lab"],
      required: false,
      default: "doctor",
    },
  },
  { timestamps: true },
);

export default model<IDoctorSession>("DoctorSession", doctorSessionSchema);
