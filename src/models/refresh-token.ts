import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expires: {
    type: Date,
    required: true,
    default: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
});

export default model("RefreshToken", refreshTokenSchema);
