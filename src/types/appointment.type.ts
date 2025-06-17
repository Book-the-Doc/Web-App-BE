export type TAppointmentType = {
  doctor: string;
  patient?: string;
  center: string;
  session: string;
  token: number;
  appointmentTime: string;
  status: string;
  notes: string;
  patientName?: string;
  phone?: string;
};
