import { Schema, model } from "mongoose";

interface IMedicalTest extends Document {
  testName: string;
  category: string;
  code: string;
  sessions: Schema.Types.ObjectId[];
  description?: string;
  preparation?: string;
  duration: number;
}

const medicalTestSchema = new Schema({
  testName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  sessions: [
    {
      type: Schema.Types.ObjectId,
      ref: "LabSession",
    },
  ],
  description: {
    type: String,
    required: false,
    trim: true,
  },
  preparation: {
    type: String,
    required: false,
    trim: true,
  },
  duration: {
    type: Number,
    required: false,
  },
});

export default model("medicalTest", medicalTestSchema, "medicalTests");
