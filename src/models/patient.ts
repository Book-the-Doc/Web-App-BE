import { Schema, model } from "mongoose";

const patientSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", "Prefer not to say"],
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["patient"],
    default: "patient",
  },
  googleId: {
    type: String || null,
    required: false,
    default: null,
  },
  phone: {
    type: String,
  },
  bloodType: {
    type: String,
  },
  emergencyContactName: {
    type: String,
  },
  emergencyContactRelation: {
    type: String,
  },
  emergencyContactPhone: {
    type: String,
  },
  emailResetToken: {
    type: String,
    default: null,
  },
  emailResetTokenExpired: {
    type: Date,
    default: null,
  },
});

export default model("Patient", patientSchema);
