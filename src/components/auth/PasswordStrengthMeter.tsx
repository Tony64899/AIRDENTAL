// PasswordStrengthMeter — spec: 01_auth.md §7 Reset Password Page
// 4-segment bar (h-1.5 rounded-full) | strength 0-4 | right-aligned label
// 0=gray | 1=red "Too weak" | 2=orange "Weak" | 3=yellow "Good" | 4=green "Strong"

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number;  // 0–4
  label: string;
}

function getStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: '' };

  let met = 0;
  if (password.length >= 12)          met++;
  if (/[A-Z]/.test(password))         met++;
  if (/[a-z]/.test(password))         met++;
  if (/[0-9]/.test(password))         met++;
  if (/[^A-Za-z0-9]/.test(password))  met++;

  if (met <= 1) return { score: 1, label: 'Too weak' };
  if (met === 2) return { score: 1, label: 'Too weak' };
  if (met === 3) return { score: 2, label: 'Weak' };
  if (met === 4) return { score: 3, label: 'Good' };
  return             { score: 4, label: 'Strong' };
}

const FILL_COLOR: Record<number, string> = {
  0: '',
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-green-500',
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label } = getStrength(password);

  return (
    <div className="space-y-1.5">

      {/* 4-segment bar */}
      <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-label="Password strength">
        {[1, 2, 3, 4].map(seg => (
          <div
            key={seg}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              seg <= score ? FILL_COLOR[score] : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Right-aligned label — only shown once typing begins */}
      {password && (
        <p className="text-xs text-slate-500 text-right">{label}</p>
      )}

    </div>
  );
}
