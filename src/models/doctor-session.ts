import { Schema, model, Document } from "mongoose";
import { RecurringFrequency, SessionStatus } from "../types/doctor.type";

interface IDoctorSession extends Document {
  doctor: Schema.Types.ObjectId;
  center: Schema.Types.ObjectId;
  sessionDate: Date;
  sessionStartTime: string;
  sessionEndTime: string;
  recurring: boolean;
  recurringFrequency?: RecurringFrequency;
  customRecurringDays?: string[];
  numberOfAppointments: number;
  availableAppointments: number;
  ongoingNumber: number;
  status: SessionStatus;
  appointments: Schema.Types.ObjectId[];
  notes?: string;
}

const doctorSessionSchema = new Schema<IDoctorSession>({
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  center: { type: Schema.Types.ObjectId, ref: 'Center', required: true, index: true },
  sessionDate: { type: Date, required: true },
  sessionStartTime: { type: String, required: true, trim: true },
  sessionEndTime: { type: String, required: true, trim: true },
  recurring: { type: Boolean, default: false },
  recurringFrequency: {
    type: String,
    enum: Object.values(RecurringFrequency),
    required: function(this: IDoctorSession) { return this.recurring; }
  },
  customRecurringDays: {
    type: [String],
    required: function(this: IDoctorSession) { return this.recurringFrequency === RecurringFrequency.CUSTOM; }
  },
  numberOfAppointments: { type: Number, required: true, min: 1 },
  availableAppointments: { type: Number },
  ongoingNumber: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(SessionStatus), default: SessionStatus.NOT_STARTED },
  appointments: [{ type: Schema.Types.ObjectId, ref: 'PatientAppointment' }],
  notes: { type: String, required: false, trim: true },
}, { timestamps: true });

// Middleware to set availableAppointments equal to numberOfAppointments when a new session is created.
doctorSessionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableAppointments = this.numberOfAppointments;
  }
  next();
});

export default model<IDoctorSession>("DoctorSession", doctorSessionSchema);
