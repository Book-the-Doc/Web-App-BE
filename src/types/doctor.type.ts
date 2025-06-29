/**
 * Enum for the different medical specialties a doctor can have.
 */
export enum MedicalSpecialty {
  CARDIOLOGY = "Cardiology",
  DERMATOLOGY = "Dermatology",
  ENDOCRINOLOGY = "Endocrinology",
  GASTROENTEROLOGY = "Gastroenterology",
  NEUROLOGY = "Neurology",
  ONCOLOGY = "Oncology",
  ORTHOPEDICS = "Orthopedics",
  PEDIATRICS = "Pediatrics",
  PSYCHIATRY = "Psychiatry",
  PULMONOLOGY = "Pulmonology",
  UROLOGY = "Urology",
  GENERAL_PRACTICE = "General Practice",
}

/**
 * Enum for how frequently a doctor's session can recur.
 */
export enum RecurringFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  CUSTOM = "custom",
}

/**
 * Enum for the overall status of a doctor's session.
 */
export enum SessionStatus {
  NOT_STARTED = "Not Started",
  ONGOING = "Ongoing",
  FINISHED = "Finished",
  CANCELLED = "Cancelled",
}

/**
 * Enum for the status of an individual patient's appointment.
 */
export enum AppointmentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CONFIRMED = "confirmed",
}
/**
 * Type definition for the payload when registering a new doctor.
 */
export type TRegisterDoctorPayload = {
  doctorName: string;
  slmcNumber: string;
  specialty?: MedicalSpecialty;
  contactNumber?: string;
};

/**
 * Type definition for the payload when creating a new doctor session.
 */
export type TCreateSessionPayload = {
  doctorId: string;
  sessionDate: Date;
  sessionStartTime: string;
  sessionEndTime: string;
  numberOfAppointments: number;
  recurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  customRecurringDays?: string[];
  notes?: string;
};

/**
 * Type definition for the payload when updating an existing doctor.
 */
export type TUpdateDoctorPayload = {
  doctorName?: string;
  specialty?: MedicalSpecialty;
  contactNumber?: string;
};
