// notification.ts — Type definitions for the Patient Notification module (Phase 8).
// ⚠️ HIPAA: Message logs contain PHI (patient name, appointment time).
//            STRICT RULE: No clinical data in SMS/Email — only name, date, time, clinic info.
//            All logs must be audit-logged. Twilio/SendGrid BAA required before production.

export type NotificationType    = 'SMS' | 'EMAIL';
export type NotificationStatus  = 'queued' | 'sent' | 'delivered' | 'failed' | 'opted_out';
export type OptOutSource        = 'sms_stop' | 'manual' | 'system';
export type PreferredMethod     = 'SMS' | 'EMAIL' | 'BOTH';

// ── Reminder schedule rule ─────────────────────────────────────────────────
export interface ReminderRule {
  id:                       string;
  hoursBeforeAppointment:   number;   // e.g. 72, 24, 2
  label:                    string;   // "72 hours before", "Day before", "2 hours before"
  sendSms:                  boolean;
  sendEmail:                boolean;
  enabled:                  boolean;
}

// ── Clinic-level notification settings ────────────────────────────────────
export interface NotificationSettings {
  clinicId:          string;
  smsEnabled:        boolean;
  emailEnabled:      boolean;
  senderName:        string;    // shown as sender name in messages
  replyToEmail:      string;
  clinicPhone:       string;    // substituted into templates
  reminderSchedule:  ReminderRule[];
  timezone:          string;    // IANA tz e.g. "America/New_York"
  updatedAt:         string;    // ISO datetime
}

// ── Message templates ──────────────────────────────────────────────────────
// Variables: {patient_name} {date} {time} {provider} {clinic_name} {clinic_phone}
export interface MessageTemplate {
  id:          string;
  clinicId:    string;
  type:        NotificationType;
  subject?:    string;   // email only
  body:        string;   // plain text for SMS; HTML for email
  charCount?:  number;   // SMS only — calculated, not stored
  updatedAt:   string;
}

// ── Patient preferences ────────────────────────────────────────────────────
export interface PatientNotificationPrefs {
  patientId:          string;
  smsOptIn:           boolean;
  emailOptIn:         boolean;
  preferredMethod:    PreferredMethod;
  optOutTimestamp?:   string;
  optOutSource?:      OptOutSource;
}

// ── Notification log entry ─────────────────────────────────────────────────
export interface NotificationLog {
  id:                  string;
  patientId:           string;
  patientName:         string;
  appointmentId:       string;
  appointmentDate:     string;   // ISO date
  appointmentTime:     string;   // "09:00"
  type:                NotificationType;
  messageContent:      string;   // full rendered message text
  status:              NotificationStatus;
  providerResponseId?: string;   // Twilio SID or SendGrid message ID
  errorMessage?:       string;
  sentAt?:             string;   // ISO datetime
  deliveredAt?:        string;
  retryCount:          number;   // 0–3
  ruleId:              string;   // which ReminderRule triggered this
}

// ── Template variable keys ─────────────────────────────────────────────────
export const TEMPLATE_VARIABLES = [
  { key: '{patient_name}',  label: 'Patient Name',  example: 'John Smith' },
  { key: '{date}',          label: 'Appt Date',     example: 'Monday, March 30' },
  { key: '{time}',          label: 'Appt Time',     example: '9:00 AM' },
  { key: '{provider}',      label: 'Provider',      example: 'Dr. Sarah Chen' },
  { key: '{clinic_name}',   label: 'Clinic Name',   example: 'Air Dental' },
  { key: '{clinic_phone}',  label: 'Clinic Phone',  example: '(617) 555-0100' },
] as const;

export type TemplateVariableKey = typeof TEMPLATE_VARIABLES[number]['key'];
