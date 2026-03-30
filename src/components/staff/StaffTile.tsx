// StaffTile — iPhone-style app launcher tile for the Staff module grid.
// Rounded square with icon, title, subtitle, and hover/press animation.

import { type LucideIcon } from 'lucide-react';

interface StaffTileProps {
  icon:       LucideIcon;
  title:      string;
  subtitle?:  string;
  color:      string;   // Tailwind bg class e.g. 'bg-[#0891b2]'
  textColor?: string;   // icon/text color, defaults to white
  isBuilt?:   boolean;  // false = coming-soon dim
  badge?:     number;   // optional count badge (red dot)
  onClick?:   () => void;
}

export function StaffTile({
  icon: Icon,
  title,
  subtitle,
  color,
  textColor = 'text-white',
  isBuilt = true,
  badge,
  onClick,
}: StaffTileProps) {
  if (!isBuilt) {
    return (
      <div className="flex flex-col items-center gap-3 select-none opacity-40 cursor-default">
        {/* Icon square */}
        <div className={[
          'w-[72px] h-[72px] rounded-[18px] flex items-center justify-center',
          'shadow-sm',
          color,
        ].join(' ')}>
          <Icon className={`w-8 h-8 ${textColor}`} />
        </div>
        {/* Label */}
        <div className="text-center">
          <div className="text-[11px] font-medium text-[#0f172a] leading-tight line-clamp-2 max-w-[84px]">
            {title}
          </div>
          {subtitle && (
            <div className="text-[10px] text-[#94a3b8] mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 group select-none focus:outline-none"
    >
      {/* Icon square */}
      <div className="relative">
        <div className={[
          'w-[72px] h-[72px] rounded-[18px] flex items-center justify-center',
          'shadow-md transition-all duration-150',
          'group-hover:shadow-lg group-hover:scale-[1.07]',
          'group-active:scale-[0.95] group-active:shadow-sm',
          color,
        ].join(' ')}>
          <Icon className={`w-8 h-8 ${textColor}`} />
        </div>

        {/* Count badge */}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-[11px] font-medium text-[#0f172a] leading-tight line-clamp-2 max-w-[84px]">
          {title}
        </div>
        {subtitle && (
          <div className="text-[10px] text-[#94a3b8] mt-0.5">{subtitle}</div>
        )}
      </div>
    </button>
  );
}
