import { Schema, model } from "mongoose";
import { AppointmentStatus } from "../types/doctor.type";

const patientAppointmentSchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
      default: null,
    },
    center: {
      type: Schema.Types.ObjectId,
      ref: "Center",
      required: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: "DoctorSession",
      required: true,
      index: true,
    },
    token: {
      type: Number,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
    },
    patientName: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    type: {
      type: String,
      enum: ["past", "upcoming"],
      default: "upcoming",
      required: true,
    },
  },
  { timestamps: true },
);

export default model("patientAppointment", patientAppointmentSchema);
