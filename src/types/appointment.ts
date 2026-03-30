// Appointment types — moved from App.tsx and extended for Phase 3+

// Status values matching ADA clinical workflow
export type AppointmentStatus =
  | 'scheduled'   // booked but not confirmed
  | 'confirmed'   // patient confirmed via reminder
  | 'arrived'     // patient checked in at front desk
  | 'in_chair'    // patient seated in operatory
  | 'completed'   // appointment finished
  | 'cancelled'   // cancelled by patient or clinic
  | 'no_show';    // patient did not arrive

// Procedure categories — drives appointment block color coding (Phase 3+)
export type ProcedureCategory =
  | 'preventive'
  | 'restorative'
  | 'endodontic'
  | 'prosthodontic'
  | 'surgical'
  | 'implant'
  | 'orthodontic'
  | 'periodontic'
  | 'cosmetic'
  | 'emergency'
  | 'consultation'
  | 'pediatric';

export interface Appointment {
  id: string;
  patientName: string;
  procedure: string;
  procedureCategory?: ProcedureCategory;  // drives color; auto-detected if omitted
  providerId: string;
  startTime: string;  // HH:MM 24-hour format
  endTime: string;    // HH:MM 24-hour format
  date?: string;      // ISO YYYY-MM-DD — the calendar day this appointment belongs to
  notes?: string;

  // Multi-tenant fields — optional in Phase 1, required from Phase 3+
  status?: AppointmentStatus;
  clinicId?: string;
  locationId?: string;
  patientId?: string;
}
