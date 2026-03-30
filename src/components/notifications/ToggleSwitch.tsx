// ToggleSwitch.tsx — Reusable animated toggle switch component.
// Used in the notification settings for enabling/disabling channels and rules.

interface ToggleSwitchProps {
  checked:   boolean;
  onChange:  (v: boolean) => void;
  label?:    string;
  disabled?: boolean;
  size?:     'sm' | 'md';
}

export function ToggleSwitch({ checked, onChange, label, disabled = false, size = 'md' }: ToggleSwitchProps) {
  const isSm = size === 'sm';

  const trackClass = isSm
    ? 'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40'
    : 'relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40';

  const knobClass = isSm
    ? `inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`
    : `inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`;

  const button = (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        trackClass,
        checked ? 'bg-[#0891b2]' : 'bg-gray-200',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
      disabled={disabled}
    >
      <span className={knobClass} />
    </button>
  );

  if (label) {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        {button}
        <span className="text-sm text-[#0f172a]">{label}</span>
      </label>
    );
  }

  return button;
}
