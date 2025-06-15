import { Schema, model } from "mongoose";

const centerSchema = new Schema({
  centerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["center"],
    default: "center",
  },
  googleId: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    required: false,
  },
  geoLocation: {
    lat: {
      type: Number,
      required: false,
      default: null,
    },
    lng: {
      type: Number,
      required: false,
      default: null,
    },
  },
  web: {
    type: String,
    required: false,
  },
  imageUrl: {
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
  // New attribute to store references to doctors registered by this center
  doctors: [
    {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
  ],
  // New attribute to store references to sessions hosted by this center
  sessions: [
    {
      type: Schema.Types.ObjectId,
      ref: "DoctorSession",
    },
  ],
});

export default model("center", centerSchema);
