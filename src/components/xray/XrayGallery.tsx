// XrayGallery — left panel thumbnail strip.
// ⚠️ HIPAA: X-ray thumbnails are PHI. Only render for authenticated users.

import { useState } from 'react';
import { Camera } from 'lucide-react';
import type { XrayImage, XrayType } from '../../types/xray';

interface XrayGalleryProps {
  xrays:      XrayImage[];
  selectedId: string | null;
  onSelect:   (id: string) => void;
  isLoading:  boolean;
}

type SortKey = 'date' | 'type' | 'tooth';

const XRAY_TYPE_COLORS: Record<XrayType, string> = {
  PA:   'bg-blue-900 text-blue-300',
  BW:   'bg-green-900 text-green-300',
  Pano: 'bg-purple-900 text-purple-300',
  FMX:  'bg-amber-900 text-amber-300',
  Ceph: 'bg-red-900 text-red-300',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function sortXrays(xrays: XrayImage[], key: SortKey): XrayImage[] {
  return [...xrays].sort((a, b) => {
    if (key === 'date')  return b.date.localeCompare(a.date);
    if (key === 'type')  return a.type.localeCompare(b.type);
    if (key === 'tooth') {
      const aNum = a.toothNumbers[0] ?? 999;
      const bNum = b.toothNumbers[0] ?? 999;
      return aNum - bNum;
    }
    return 0;
  });
}

export function XrayGallery({ xrays, selectedId, onSelect, isLoading }: XrayGalleryProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');

  if (isLoading) {
    return (
      <div className="p-2 space-y-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-[#1a1a1a] rounded-xl h-28" />
        ))}
      </div>
    );
  }

  const sorted = sortXrays(xrays, sortKey);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sort controls */}
      <div className="flex gap-1 px-2 pt-2 pb-1 flex-shrink-0">
        {(['date', 'type', 'tooth'] as SortKey[]).map(key => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={[
              'text-[9px] font-medium px-1.5 py-0.5 rounded transition-colors',
              sortKey === key
                ? 'bg-[#0891b2] text-white'
                : 'text-[#555] hover:text-[#888] bg-[#1a1a1a]',
            ].join(' ')}
          >
            {key === 'date' ? 'Date ↓' : key === 'type' ? 'Type' : 'Tooth'}
          </button>
        ))}
      </div>

      {/* Thumbnail list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-2">
            <Camera className="w-8 h-8 text-[#333] mb-2" />
            <p className="text-[11px] text-[#444] font-medium">No X-rays on record</p>
            <p className="text-[10px] text-[#333] mt-0.5">Upload to get started</p>
          </div>
        ) : (
          sorted.map(xray => {
            const isSelected = xray.id === selectedId;
            return (
              <div
                key={xray.id}
                onClick={() => onSelect(xray.id)}
                className={[
                  'rounded-xl overflow-hidden border-2 transition-all cursor-pointer mb-2',
                  isSelected
                    ? 'border-[#0891b2] ring-2 ring-[#0891b2]/20'
                    : 'border-transparent hover:border-gray-700',
                ].join(' ')}
              >
                {/* Dark image area */}
                <div className="bg-[#0a0a0a] h-20 flex items-center justify-center overflow-hidden">
                  <img
                    src={xray.thumbnailUrl}
                    alt={`${xray.type} ${xray.date}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                {/* Metadata row */}
                <div className="bg-[#1a1a1a] px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${XRAY_TYPE_COLORS[xray.type]}`}>
                      {xray.type}
                    </span>
                    <span className="text-[10px] text-[#555]">{formatDate(xray.date)}</span>
                  </div>
                  {xray.toothNumbers.length > 0 && (
                    <div className="text-[9px] text-[#444] mt-0.5">
                      Tooth {xray.toothNumbers.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
