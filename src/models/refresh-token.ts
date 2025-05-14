import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    refPath: "user_type",
    required: true,
  },
  user_type: {
    type: String,
    required: true,
    enum: ["patient", "medicalCenter"],
  },
  expires: {
    type: Date,
    required: true,
    default: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
});

export default model("RefreshToken", refreshTokenSchema);
