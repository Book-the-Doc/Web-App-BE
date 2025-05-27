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
    default: null,
  },
  phone: {
    type: String,
    required: false,
  },
  bloodType: {
    type: String,
    required: false,
  },
  emergencyContact: {
    name: {
      type: String,
      required: false,
    },
    relation: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
  },
  profilePicUrl: {
    type: String,
    required: false,
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

export default model("patient", patientSchema);
