// AppointmentCard — absolute-positioned appointment block within a provider column.
// Phase 3+: procedure-category color coding, drag-to-move handle, bottom resize handle,
//           single-click → sidebar patient info, double-click → AppointmentModal,
//           privacy mode masks patient name.
// ⚠️ HIPAA: Privacy Mode is UI-only — PHI stays in memory and audit logging still applies.
//            Privacy Mode is intended for patient-facing screen situations.

import { useState, useRef, useEffect } from 'react';
import { GripVertical }                from 'lucide-react';
import { formatTime, timeToMinutes, minutesToTime } from '../../utils/dateUtils';
import { getProcedureColor, getCategoryFromProcedure } from '../../utils/procedureColors';
import type { Appointment } from '../../types/appointment';

interface AppointmentCardProps {
  appointment:   Appointment;
  top:           number;      // px offset from top of provider column
  height:        number;      // px height (derived from duration)
  cellHeight:    number;      // px per 15-minute slot — for drag/resize snapping
  privacyMode:   boolean;
  onSingleClick: () => void;  // single click → show patient info in sidebar
  onDoubleClick: () => void;  // double click → open AppointmentModal
  onResize:      (newEndTime: string) => void;
  onDragStart:   (e: React.MouseEvent) => void;
}

export function AppointmentCard({
  appointment,
  top,
  height,
  cellHeight,
  privacyMode,
  onSingleClick,
  onDoubleClick,
  onResize,
  onDragStart,
}: AppointmentCardProps) {
  // displayHeight drives the visual height during a resize drag; syncs from prop otherwise
  const [displayHeight, setDisplayHeight] = useState(height);
  const isResizingRef = useRef(false);
  const currentHRef   = useRef(height);

  useEffect(() => {
    if (!isResizingRef.current) {
      setDisplayHeight(height);
      currentHRef.current = height;
    }
  }, [height]);

  // Derive color from procedureCategory (explicit) or auto-detected from procedure name
  const colors = getProcedureColor(
    appointment.procedureCategory ?? getCategoryFromProcedure(appointment.procedure),
  );

  // Content visibility thresholds
  const showProcAndChart = displayHeight >= cellHeight * 3;  // ≥ 45 min
  const showTime         = displayHeight >= cellHeight * 2;  // ≥ 30 min

  // Simulated chart number from patientId — Phase 4 will use real chart IDs
  const chartNum = appointment.patientId
    ? `#${appointment.patientId.replace('pat-', '').padStart(3, '0')}`
    : '#---';

  // ── Single / Double click disambiguation ──────────────────────────────────
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const hasDraggedRef = useRef(false);  // set true if moved enough during mousedown → prevents click

  const handleClick = () => {
    if (hasDraggedRef.current) return;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = undefined;
      onDoubleClick();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = undefined;
        onSingleClick();
      }, 280);
    }
  };

  // ── Bottom resize handle ───────────────────────────────────────────────────
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isResizingRef.current = true;
    const startY = e.clientY;
    const startH = displayHeight;
    currentHRef.current = startH;

    const onMove = (ev: MouseEvent) => {
      const rawH  = Math.max(cellHeight, startH + (ev.clientY - startY));
      const snapped = Math.round(rawH / cellHeight) * cellHeight;
      currentHRef.current = snapped;
      setDisplayHeight(snapped);
    };

    const onUp = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      const startMins  = timeToMinutes(appointment.startTime);
      const endMins    = Math.min(23 * 60 + 45, startMins + (currentHRef.current / cellHeight) * 15);
      const newEndTime = minutesToTime(endMins);
      if (newEndTime !== appointment.endTime) onResize(newEndTime);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  };

  // ── Top drag handle (mousedown → CalendarGrid takes over) ─────────────────
  const handleDragMouseDown = (e: React.MouseEvent) => {
    hasDraggedRef.current = false;
    // Let CalendarGrid manage the drag; cancel pending single-click if we actually move
    onDragStart(e);
  };

  return (
    <div
      className="absolute left-1 right-1 rounded-md border overflow-visible select-none group z-10"
      style={{
        top,
        height:          displayHeight,
        backgroundColor: colors.bg,
        borderColor:     colors.border,
        borderLeftWidth: 3,
        boxShadow:       '0 1px 2px rgba(0,0,0,0.07)',
        cursor:          'pointer',
      }}
      onClick={handleClick}
    >
      {/* ── Top drag handle strip ── */}
      <div
        className="absolute top-0 left-0 right-0 h-5 flex items-center justify-center cursor-grab active:cursor-grabbing rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
        style={{ backgroundColor: `${colors.border}18` }}
        onMouseDown={handleDragMouseDown}
        title="Drag to move"
        onClick={e => e.stopPropagation()}  // prevent click-through to card
      >
        <GripVertical size={12} style={{ color: colors.border, opacity: 0.6 }} />
      </div>

      {/* ── Content ── */}
      <div className="h-full flex flex-col px-2 py-1 overflow-hidden pt-1">

        {/* Row 1: Patient name + chart # */}
        <div className="flex items-baseline gap-1.5 min-w-0 mt-0.5">
          <span
            className={`text-[11px] font-bold truncate leading-tight ${privacyMode ? 'font-mono tracking-widest text-gray-400' : ''}`}
            style={{ color: privacyMode ? undefined : colors.text }}
          >
            {privacyMode ? '● ● ●' : appointment.patientName}
          </span>
          {showProcAndChart && !privacyMode && (
            <span className="text-[9px] text-gray-400 flex-shrink-0 leading-tight">
              {chartNum}
            </span>
          )}
        </div>

        {/* Row 2: Procedure name */}
        {showProcAndChart && (
          <div
            className="text-[10px] truncate leading-tight mt-0.5"
            style={{ color: colors.text, opacity: 0.72 }}
          >
            {appointment.procedure}
          </div>
        )}

        {/* Row 3: Time range — pinned to bottom */}
        {showTime && (
          <div className="text-[9px] text-gray-400 mt-auto leading-tight whitespace-nowrap">
            {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
          </div>
        )}
      </div>

      {/* ── Bottom resize handle ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-b-md"
        style={{ backgroundColor: `${colors.border}18` }}
        onMouseDown={handleResizeMouseDown}
        onClick={e => e.stopPropagation()}
        title="Drag to resize"
      >
        <div className="flex flex-col items-center gap-[2px]">
          <div className="w-5 h-px rounded-full opacity-50" style={{ backgroundColor: colors.border }} />
          <div className="w-5 h-px rounded-full opacity-50" style={{ backgroundColor: colors.border }} />
        </div>
      </div>
    </div>
  );
}
