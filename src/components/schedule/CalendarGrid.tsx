// CalendarGrid — appointment scheduling grid, Phase 3+ rewrite.
//
// Features:
//   • Sticky header row (provider names stay visible while scrolling vertically)
//   • Sticky time column (stays visible while scrolling horizontally)
//   • Absolute-positioned AppointmentCard blocks per provider column
//   • Date-aware filtering: only appointments matching currentDate are shown
//   • Aligned hour/15-min grid lines between time column and provider columns
//   • Drag-to-move: drag top handle across columns and up/down for time
//   • Column reorder: GripHorizontal button → popup ← → arrows
//   • Privacy Mode: passes through to AppointmentCard to mask patient names
//
// ⚠️ HIPAA: Privacy Mode is UI-only. PHI stays in memory. Audit logging still applies.

import { useState, useRef, useCallback } from 'react';
import { Settings, GripHorizontal }      from 'lucide-react';
import { AppointmentCard }               from './AppointmentCard';
import { ColumnSettingsModal }           from './ColumnSettingsModal';
import { formatTime, timeToMinutes, minutesToTime } from '../../utils/dateUtils';
import { getProcedureColor, getCategoryFromProcedure } from '../../utils/procedureColors';
import type { Provider }    from '../../types/provider';
import type { Appointment } from '../../types/appointment';

// ── Layout constants ──────────────────────────────────────────────────────
const CELL_HEIGHT_PX = 24;  // px per 15-minute slot
const TIME_COL_W     = 48;  // px — left time-label column (2/3 of original 72px)
const MIN_COL_W      = 200; // px — min per-provider column width

// ── Drag-to-move state ────────────────────────────────────────────────────
interface MoveDragState {
  appointmentId:      string;
  ghostX:             number;
  ghostY:             number;
  startMouseY:        number;
  originalStartMins:  number;
  durationMins:       number;
  targetProviderId:   string;
  targetStartTime:    string;
  targetEndTime:      string;
  ghostHeight:        number;
  colRects:           Array<{ providerId: string; left: number; right: number }>;
}

// ── Props ─────────────────────────────────────────────────────────────────
interface CalendarGridProps {
  providers:                Provider[];
  appointments:             Appointment[];
  timeRange:                { start: number; end: number };
  currentDate:              string;   // ISO YYYY-MM-DD for date filtering
  privacyMode:              boolean;
  onAppointmentSingleClick: (apt: Appointment) => void;  // → sidebar patient info
  onAppointmentDoubleClick: (apt: Appointment) => void;  // → AppointmentModal
  onAppointmentUpdate:      (id: string, updates: Partial<Appointment>) => void;
  onProviderUpdate:         (id: string, updates: Partial<Provider>) => void;
  onReorderProvider:        (id: string, direction: 'left' | 'right') => void;
  onOpenTimeSettings:       () => void;
}

/** Convert HH:MM to px offset from top of the visible range. */
function timeToPixel(time: string, rangeStartHour: number): number {
  const [h, m] = time.split(':').map(Number);
  return ((h * 60 + m - rangeStartHour * 60) / 15) * CELL_HEIGHT_PX;
}

// ── Component ─────────────────────────────────────────────────────────────
export function CalendarGrid({
  providers,
  appointments,
  timeRange,
  currentDate,
  privacyMode,
  onAppointmentSingleClick,
  onAppointmentDoubleClick,
  onAppointmentUpdate,
  onProviderUpdate,
  onReorderProvider,
  onOpenTimeSettings,
}: CalendarGridProps) {
  const [colSettingsId, setColSettingsId] = useState<string | null>(null);
  const [moveMenuId,    setMoveMenuId]    = useState<string | null>(null);
  const [moveState,     setMoveState]     = useState<MoveDragState | null>(null);

  const scrollRef  = useRef<HTMLDivElement>(null);
  const gridBodyRef = useRef<HTMLDivElement>(null);

  // Build 15-minute slot list
  const timeSlots: string[] = [];
  for (let h = timeRange.start; h < timeRange.end; h++) {
    for (const m of [0, 15, 30, 45]) {
      timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }

  const isHour        = (s: string) => s.endsWith(':00');
  const totalHeight   = timeSlots.length * CELL_HEIGHT_PX;
  const minWidth      = TIME_COL_W + providers.length * MIN_COL_W;
  const endTimeLabel  = `${String(timeRange.end).padStart(2, '0')}:00`;

  // ── Column settings save ────────────────────────────────────────────────
  const handleColSave = useCallback(
    (updates: Partial<Provider>) => {
      if (colSettingsId) {
        onProviderUpdate(colSettingsId, updates);
        setColSettingsId(null);
      }
    },
    [colSettingsId, onProviderUpdate],
  );

  // ── Drag-to-move start ──────────────────────────────────────────────────
  const handleDragStart = useCallback(
    (apt: Appointment, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Collect column bounding rects at drag start
      const colEls = gridBodyRef.current?.querySelectorAll<HTMLElement>('[data-provider-col]');
      const colRects = Array.from(colEls ?? []).map((el, i) => {
        const rect = el.getBoundingClientRect();
        return { providerId: providers[i].id, left: rect.left, right: rect.right };
      });

      const originalStartMins = timeToMinutes(apt.startTime);
      const durationMins      = timeToMinutes(apt.endTime) - originalStartMins;
      const ghostHeight       = (durationMins / 15) * CELL_HEIGHT_PX;

      const state: MoveDragState = {
        appointmentId:     apt.id,
        ghostX:            e.clientX,
        ghostY:            e.clientY,
        startMouseY:       e.clientY,
        originalStartMins,
        durationMins,
        targetProviderId:  apt.providerId,
        targetStartTime:   apt.startTime,
        targetEndTime:     apt.endTime,
        ghostHeight,
        colRects,
      };
      setMoveState(state);

      const onMove = (mv: MouseEvent) => {
        const deltaY       = mv.clientY - state.startMouseY;
        const deltaMins    = Math.round(deltaY / CELL_HEIGHT_PX) * 15;
        const newStartMins = Math.max(
          timeRange.start * 60,
          Math.min(timeRange.end * 60 - durationMins, originalStartMins + deltaMins),
        );
        const newEndMins   = newStartMins + durationMins;

        // Detect target column from horizontal mouse position
        const hit = state.colRects.find(r => mv.clientX >= r.left && mv.clientX <= r.right);
        const targetProviderId = hit?.providerId ?? state.targetProviderId;

        setMoveState(prev => prev ? {
          ...prev,
          ghostX:           mv.clientX,
          ghostY:           mv.clientY,
          targetProviderId,
          targetStartTime:  minutesToTime(newStartMins),
          targetEndTime:    minutesToTime(newEndMins),
        } : null);
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);

        setMoveState(prev => {
          if (prev) {
            const changed =
              prev.targetProviderId !== apt.providerId ||
              prev.targetStartTime  !== apt.startTime  ||
              prev.targetEndTime    !== apt.endTime;
            if (changed) {
              onAppointmentUpdate(apt.id, {
                providerId: prev.targetProviderId,
                startTime:  prev.targetStartTime,
                endTime:    prev.targetEndTime,
              });
            }
          }
          return null;
        });
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    },
    [providers, timeRange, onAppointmentUpdate],
  );

  // Close move menu when clicking outside
  const handleGridClick = () => {
    if (moveMenuId) setMoveMenuId(null);
  };

  return (
    <div
      className="flex-1 overflow-hidden flex flex-col bg-[#f8fafc]"
      onClick={handleGridClick}
    >
      {/* ══════════════════════════════════════════════════════════════════
          Single scroll container — sticky header + sticky time column
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto" ref={scrollRef}>
        <div style={{ minWidth }}>

          {/* ── Sticky header row ── */}
          <div className="sticky top-0 z-20 flex bg-white border-b-2 border-gray-200 shadow-sm">

            {/* Corner cell: gear → TimeSettingsModal */}
            <div
              className="sticky left-0 z-30 flex-shrink-0 flex items-center justify-center bg-white border-r border-gray-200"
              style={{ width: TIME_COL_W, minHeight: 52 }}
            >
              <button
                onClick={onOpenTimeSettings}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-[#94a3b8] hover:text-[#475569] transition-colors"
                title="Time / Column Settings"
              >
                <Settings size={14} />
              </button>
            </div>

            {/* Provider column headers */}
            {providers.map((provider, idx) => (
              <div
                key={provider.id}
                className="flex-1 border-r border-gray-200 px-3 py-3 flex items-center justify-between relative"
                style={{ minWidth: MIN_COL_W }}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#0f172a] text-sm truncate">{provider.name}</div>
                  <div className="text-xs text-[#94a3b8] truncate">{provider.operatory}</div>
                </div>

                {/* Right-side controls: move + settings */}
                <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">

                  {/* Column reorder button */}
                  <div className="relative">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setMoveMenuId(prev => prev === provider.id ? null : provider.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-[#94a3b8] hover:text-[#475569] transition-colors"
                      title="Reorder column"
                    >
                      <GripHorizontal size={13} />
                    </button>

                    {moveMenuId === provider.id && (
                      <div
                        className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden"
                        style={{ minWidth: 120 }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { onReorderProvider(provider.id, 'left'); setMoveMenuId(null); }}
                          disabled={idx === 0}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#374151] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ← Move Left
                        </button>
                        <button
                          onClick={() => { onReorderProvider(provider.id, 'right'); setMoveMenuId(null); }}
                          disabled={idx === providers.length - 1}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#374151] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Move Right →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Column settings gear */}
                  <button
                    onClick={e => { e.stopPropagation(); setColSettingsId(provider.id); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-[#94a3b8] hover:text-[#475569] transition-colors"
                    title="Rename provider / operatory"
                  >
                    <Settings size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Grid body ── */}
          <div className="flex" ref={gridBodyRef}>

            {/* Time label column — sticky left */}
            <div
              className="sticky left-0 z-10 flex-shrink-0 bg-white border-r border-gray-200"
              style={{ width: TIME_COL_W }}
            >
              {timeSlots.map((slot, i) => (
                <div
                  key={slot}
                  className="relative"
                  style={{ height: CELL_HEIGHT_PX }}
                >
                  {/* Grid line at TOP of cell — matches provider column border-t */}
                  <div
                    className={`absolute top-0 left-0 right-0 ${
                      isHour(slot) ? 'border-t-2 border-gray-200' : 'border-t border-gray-100'
                    }`}
                  />
                  {/* Hour label sits INSIDE the first 15-min cell of each hour block.
                      Positioned 4px below the hour boundary line. */}
                  {isHour(slot) && (
                    <span
                      className="absolute left-0 right-1 text-[13px] font-bold text-[#475569] select-none leading-none text-right"
                      style={{ top: 4 }}
                    >
                      {formatTime(slot)}
                    </span>
                  )}
                </div>
              ))}

              {/* Final closing border at end of time range */}
              <div className="relative" style={{ height: 1 }}>
                <div className="absolute top-0 left-0 right-0 border-t-2 border-gray-200" />
              </div>
            </div>

            {/* Provider columns */}
            {providers.map((provider) => {
              const colAppts = appointments.filter(
                a => a.providerId === provider.id && a.date === currentDate,
              );
              const isDragTarget = moveState?.targetProviderId === provider.id;

              return (
                <div
                  key={provider.id}
                  data-provider-col
                  className="flex-1 relative border-r border-gray-200 transition-colors duration-150"
                  style={{
                    minWidth: MIN_COL_W,
                    height: totalHeight,
                    backgroundColor: isDragTarget ? '#f0f9ff' : 'white',
                  }}
                >
                  {/* Horizontal grid lines — border-t aligned with time column */}
                  {timeSlots.map((slot, i) => (
                    <div
                      key={slot}
                      className={`absolute left-0 right-0 pointer-events-none ${
                        isHour(slot) ? 'border-t-2 border-gray-200' : 'border-t border-gray-100'
                      }`}
                      style={{ top: i * CELL_HEIGHT_PX }}
                    />
                  ))}
                  {/* Closing bottom line */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-gray-200 pointer-events-none"
                    style={{ top: totalHeight }}
                  />

                  {/* Appointment blocks */}
                  {colAppts.map(apt => {
                    const topPx    = timeToPixel(apt.startTime, timeRange.start);
                    const heightPx = timeToPixel(apt.endTime,   timeRange.start) - topPx;
                    if (topPx < 0 || heightPx <= 0) return null;

                    // Show drag placeholder (dimmed) for the appointment being moved
                    const isBeingDragged = moveState?.appointmentId === apt.id;

                    return (
                      <div
                        key={apt.id}
                        style={{ opacity: isBeingDragged ? 0.3 : 1, transition: 'opacity 120ms' }}
                      >
                        <AppointmentCard
                          appointment={apt}
                          top={topPx}
                          height={heightPx}
                          cellHeight={CELL_HEIGHT_PX}
                          privacyMode={privacyMode}
                          onSingleClick={() => onAppointmentSingleClick(apt)}
                          onDoubleClick={() => onAppointmentDoubleClick(apt)}
                          onResize={newEnd => onAppointmentUpdate(apt.id, { endTime: newEnd })}
                          onDragStart={e => handleDragStart(apt, e)}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>{/* /minWidth wrapper */}
      </div>{/* /scroll container */}

      {/* ── Drag ghost — follows cursor ── */}
      {moveState && (() => {
        const apt = appointments.find(a => a.id === moveState.appointmentId);
        if (!apt) return null;
        const colors = getProcedureColor(
          apt.procedureCategory ?? getCategoryFromProcedure(apt.procedure),
        );
        const targetProv = providers.find(p => p.id === moveState.targetProviderId);
        return (
          <div
            className="fixed z-50 pointer-events-none rounded-md border shadow-2xl"
            style={{
              left:            moveState.ghostX + 14,
              top:             moveState.ghostY - 24,
              width:           MIN_COL_W - 12,
              height:          moveState.ghostHeight,
              backgroundColor: colors.bg,
              borderColor:     colors.border,
              borderLeftWidth: 3,
              opacity:         0.92,
              transform:       'rotate(1.5deg)',
            }}
          >
            <div className="px-2 py-1.5">
              <div className="text-[11px] font-bold leading-tight" style={{ color: colors.text }}>
                {privacyMode ? '● ● ●' : apt.patientName}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {formatTime(moveState.targetStartTime)} – {formatTime(moveState.targetEndTime)}
              </div>
              {targetProv && (
                <div className="text-[9px] text-gray-400 mt-0.5 truncate">
                  → {targetProv.operatory}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Column settings modal (rename provider / operatory) */}
      {colSettingsId && (
        <ColumnSettingsModal
          provider={providers.find(p => p.id === colSettingsId)!}
          onClose={() => setColSettingsId(null)}
          onSave={handleColSave}
        />
      )}
    </div>
  );
}
