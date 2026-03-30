// Forgot password page — user enters email to receive a reset link.
// ⚠️ HIPAA: Response messaging is deliberately vague (no email enumeration).

import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { AuthPageShell } from '../components/auth/AuthPageShell';

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Reset Password"
      subtitle="Enter the email address associated with your account and we'll send you a link to reset your password."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
