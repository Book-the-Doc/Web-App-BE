import { Schema, model } from "mongoose";

const centerSchema = new Schema({
  centerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
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
});

export default model("center", centerSchema);
