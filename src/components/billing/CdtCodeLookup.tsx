// CdtCodeLookup.tsx — searchable CDT code browser with category filters.
// ⚠️ HIPAA: CDT code selection may be associated with PHI treatment records.

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Plus } from 'lucide-react';
import type { CdtCode } from './types';
import { getCdtCodes } from '../../services/billingService';
import { formatCurrency } from '../../utils/formatUtils';

interface CdtCodeLookupProps {
  onSelect?: (code: CdtCode) => void;
  embedded?: boolean;
}

export default function CdtCodeLookup({ onSelect, embedded = false }: CdtCodeLookupProps) {
  const [codes, setCodes]       = useState<CdtCode[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getCdtCodes().then(data => {
      setCodes(data);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(codes.map(c => c.category)));
    return ['All', ...cats];
  }, [codes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return codes.filter(c => {
      const matchCat = category === 'All' || c.category === category;
      const matchQ   = !q ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.layperson.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [codes, search, category]);

  const inner = (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by code, description, or keyword…"
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filter row */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={[
              'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors',
              category === cat
                ? 'bg-[#0891b2] text-white border-[#0891b2]'
                : 'border-gray-200 text-[#64748b] hover:border-[#0891b2] hover:text-[#0891b2]',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-[#94a3b8] py-8">
          No codes found
        </div>
      ) : (
        <div className={embedded ? 'overflow-y-auto max-h-56' : 'overflow-y-auto flex-1'}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3 whitespace-nowrap">Code</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Description</th>
                <th className="text-left text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2 pr-3">Patient-Friendly</th>
                <th className="text-right text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest pb-2">Default Fee</th>
                {onSelect && <th className="pb-2 w-10" />}
              </tr>
            </thead>
            <tbody>
              {filtered.map(code => (
                <tr
                  key={code.code}
                  onClick={() => onSelect?.(code)}
                  className={[
                    'border-b border-gray-100',
                    onSelect ? 'cursor-pointer hover:bg-[#f0f9ff]' : 'hover:bg-gray-50',
                  ].join(' ')}
                >
                  <td className="py-2 pr-3 font-mono text-[#0891b2] font-medium whitespace-nowrap">{code.code}</td>
                  <td className="py-2 pr-3 text-[#0f172a]">{code.description}</td>
                  <td className="py-2 pr-3 text-[#64748b]">{code.layperson}</td>
                  <td className="py-2 text-right font-medium text-[#0f172a] whitespace-nowrap">
                    {formatCurrency(code.defaultFee / 100)}
                  </td>
                  {onSelect && (
                    <td className="py-2 pl-2">
                      <button
                        onClick={e => { e.stopPropagation(); onSelect(code); }}
                        className="p-1 rounded hover:bg-[#0891b2]/10 text-[#0891b2]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (embedded) return inner;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col" style={{ minHeight: 400 }}>
      <h2 className="text-base font-semibold text-[#0f172a] mb-4">CDT Code Reference</h2>
      {inner}
    </div>
  );
}
