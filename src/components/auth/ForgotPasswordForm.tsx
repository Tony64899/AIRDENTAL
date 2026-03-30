import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import * as authService from '../../services/authService';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await authService.forgotPassword(email);
    setIsLoading(false);
    if (result.success) {
      setSuccessMessage(result.message);
    }
  };

  return (
    <>
      {successMessage ? (
        /* Success state */
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="block text-sm font-medium text-[#1a202c]">
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="provider@airdental.com"
              required
              autoComplete="email"
              autoFocus
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 border border-[#CBD5E0] rounded-lg text-sm
                         bg-white text-[#1a202c] placeholder:text-[#A0AEC0]
                         focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:border-[#3182CE]
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 bg-[#1e293b] text-white rounded-xl text-sm
                       font-semibold hover:bg-[#0f172a] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>
      )}

      {/* Back to login */}
      <div className="text-center pt-2">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1a202c] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>

      {/* HIPAA notice */}
      <p className="text-center text-xs text-[#93A3B8] pt-1">
        HIPAA Compliant System &middot; All access attempts are logged
      </p>
    </>
  );
}
