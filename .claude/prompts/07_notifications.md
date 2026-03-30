# 🔔 Page Prompt 07 — Patient Notifications
# 저장 경로: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\prompts\07_notifications.md
# 사용법: MASTER_PROMPT.md 복붙 후, 이 파일 내용을 바로 아래에 추가로 복붙

---

```
Let's build Page 07: Patient Notifications for Air Dental.

## Purpose
Automated SMS and email reminders sent to patients for upcoming appointments.
Uses Twilio (SMS) and SendGrid (Email) — both HIPAA BAA signed. ⚠️ HIPAA

## Notification Settings Page (Admin)
- Toggle SMS on/off per clinic
- Toggle Email on/off per clinic
- Sender name (e.g. "Air Dental — Dr. Nahm's Office")
- Reply-to email address
- Default reminder schedule:
  - 72 hours before appointment (email)
  - 24 hours before appointment (SMS + email)
  - 2 hours before appointment (SMS)

## Message Templates
- Separate templates for SMS and Email
- Variables: {patient_name}, {date}, {time}, {provider}, {clinic_name}, {clinic_phone}
- Example SMS:
  "Hi {patient_name}, reminder: appt at {clinic_name} on {date} at {time} with {provider}. Reply STOP to opt out."
- Example Email: full HTML template with clinic logo area
- Edit templates in simple rich text editor

## Per-Patient Preferences
- In patient profile: notification preferences tab
- Opt-in/opt-out for SMS, Email independently
- Preferred contact method
- Opt-out history logged ⚠️ HIPAA

## Notification Log
- Table of all sent notifications
- Columns: patient, type (SMS/Email), message, sent time, status (delivered/failed/opted-out)
- Filter by date, type, status
- Click row → see full message content

## Failed Notification Alerts
- Dashboard widget showing failed sends today
- Click to retry or dismiss

## HIPAA Notes ⚠️ HIPAA
- SMS/Email content must NOT include clinical details (diagnosis, procedures)
- Only: patient name, date, time, clinic name, phone number
- Twilio and SendGrid BAA must be in place before any PHI is sent
  👩‍💻 SISTER TASK: Verify BAA documents with Twilio and SendGrid
  👨‍💻 BIL TASK: Review notification API logic and opt-out handling

## Save location
Frontend: C:\Users\Anthony Lee\OneDrive\Dental EDR Software\Air Dental\Air Dental\frontend\src\pages\Notifications.tsx
Components: C:\...\frontend\src\components\notifications\
Backend: C:\...\backend\src\notifications\

Start with the Notification Settings page UI first.
Then build the message template editor.
```
