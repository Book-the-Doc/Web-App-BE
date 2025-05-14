import { Schema, model } from "mongoose";

const patientSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "patient",
  },
  blood_type: {
    type: String,
  },
  googleId: {
    type: String || null,
    required: false,
    default: null,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", "Prefer not to say"],
  },
  emergency_contact_relation: {
    type: String,
  },
  emergency_contact_name: {
    type: String,
  },
  emergency_contact_phone: {
    type: String,
  },
});

export default model("Patient", patientSchema);
