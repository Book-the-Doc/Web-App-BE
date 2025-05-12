import { Schema, model } from "mongoose";

const medicalCenterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  medicalNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zipCode: {
    type: Number,
    required: false,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "medicalCenter",
  },
  googleUserId: {
    type: String,
    required: false,
    default: null,
  },
});

export default model("MedicalCenter", medicalCenterSchema);
