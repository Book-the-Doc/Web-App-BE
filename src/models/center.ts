import { Schema, model } from "mongoose";

const medicalCenterSchema = new Schema({
  center_name: {
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
    required: false,
    default: "",
  },
  address: {
    type: String,
    required: true,
  },
  web_site_url: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["medicalCenter"],
    default: "medicalCenter",
  },
  google_id: {
    type: String,
    required: false,
    default: null,
  },
  geo_location: {
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
  doctor_ids: {
    type: [Schema.Types.ObjectId],
    ref: "Doctor",
    required: false,
    default: [],
  },
});

export default model("MedicalCenter", medicalCenterSchema);
