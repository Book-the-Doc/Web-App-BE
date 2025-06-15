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
      required: true,
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
    appointmentNumber: {
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
      default: AppointmentStatus.BOOKED,
    },
    reason: {
      type: String,
      required: false,
      trim: true,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true },
);

export default model("PatientAppointment", patientAppointmentSchema);
