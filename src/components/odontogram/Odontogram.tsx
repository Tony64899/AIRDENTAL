// Odontogram — interactive tooth chart embedded in the Patient Chart page.
// ⚠️ HIPAA: Clinical PHI. Every surface click creates an audit log entry.

import { useState, useEffect, useRef } from 'react';
import type { SurfaceName } from '../../types/patient';
import { useOdontogram } from '../../hooks/useOdontogram';
import { TREATMENT_COLORS, TREATMENT_LABELS, ALL_TREATMENTS } from './odontogram.types';
import { OdontogramToolbar }  from './OdontogramToolbar';
import { UpperArch }          from './UpperArch';
import { LowerArch }          from './LowerArch';
import { ToothTooltip }       from './ToothTooltip';
import { ToothContextMenu }   from './ToothContextMenu';
import { ToothDetailPanel }   from './ToothDetailPanel';

interface OdontogramProps {
  patientId: string;
}

export function Odontogram({ patientId }: OdontogramProps) {
  const {
    odontogram,
    loadState,
    selectedTreatment,
    setSelectedTreatment,
    handleSurfaceClick,
    handleToothLevelSet,
    handleClearTooth,
    handleClearAll,
    updateNotes,
    linkCDT,
    unlinkCDT,
    setMode,
    undo,
    redo,
    canUndo,
    canRedo,
    pendingChanges,
    saving,
    lastSaved,
    save,
  } = useOdontogram(patientId);

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const [tooltip, setTooltip] = useState<{
    toothNumber: number;
    surface: SurfaceName;
    x: number;
    y: number;
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    toothNumber: number;
    x: number;
    y: number;
  } | null>(null);

  const [detailTooth, setDetailTooth] = useState<{
    toothNumber: number;
    tab: 'notes' | 'history';
  } | null>(null);

  // Debounce tooltip: only show after 250ms hover
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Escape') {
        setDetailTooth(null);
        setContextMenu(null);
        setTooltip(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // ── Surface hover handling ───────────────────────────────────────────────────
  function handleSurfaceHover(
    toothNumber: number,
    surface: SurfaceName | null,
    x: number,
    y: number,
  ) {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    if (!surface) {
      setTooltip(null);
      return;
    }
    tooltipTimerRef.current = setTimeout(() => {
      setTooltip({ toothNumber, surface, x, y });
    }, 250);
  }

  // ── Context menu handler ─────────────────────────────────────────────────────
  function handleContextMenu(toothNumber: number, x: number, y: number) {
    setContextMenu({ toothNumber, x, y });
  }

  // ── Tooth click (select/deselect) ────────────────────────────────────────────
  function handleToothClick(toothNumber: number) {
    setSelectedTooth(prev => prev === toothNumber ? null : toothNumber);
  }

  // ── Double click → detail panel (notes tab) ──────────────────────────────────
  function handleDoubleClick(toothNumber: number) {
    setDetailTooth({ toothNumber, tab: 'notes' });
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loadState === 'loading' || loadState === 'idle' || !odontogram) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 rounded-2xl h-16" />
        <div className="animate-pulse bg-gray-200 rounded-2xl h-48" />
        <div className="animate-pulse bg-gray-200 rounded-2xl h-12" />
      </div>
    );
  }

  // ── Tooltip surface data ─────────────────────────────────────────────────────
  const tooltipSurfaceData = tooltip
    ? odontogram.teeth
        .find(t => t.toothNumber === tooltip.toothNumber)
        ?.surfaces.find(s => s.name === tooltip.surface)
    : null;

  // ── Detail panel tooth ───────────────────────────────────────────────────────
  const detailToothState = detailTooth
    ? odontogram.teeth.find(t => t.toothNumber === detailTooth.toothNumber)
    : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <OdontogramToolbar
        mode={odontogram.mode}
        selectedTreatment={selectedTreatment}
        canUndo={canUndo}
        canRedo={canRedo}
        pendingChanges={pendingChanges}
        saving={saving}
        lastSaved={lastSaved}
        onModeChange={(m) => setMode(m)}
        onTreatmentChange={setSelectedTreatment}
        onUndo={undo}
        onRedo={redo}
        onClearAll={handleClearAll}
        onPrint={() => window.print()}
        onSave={save}
      />

      {/* Tooth grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 overflow-x-auto">
        {/* Mode banner */}
        <div
          className={[
            'text-[10px] font-bold uppercase tracking-widest text-center mb-3 py-1 rounded',
            odontogram.mode === 'existing'
              ? 'text-[#4A90D9] bg-blue-50'
              : 'text-[#E74C3C] bg-red-50',
          ].join(' ')}
        >
          Mode: {odontogram.mode === 'existing' ? 'Existing' : 'Planned'} Conditions
        </div>

        <UpperArch
          teeth={odontogram.teeth}
          selectedTooth={selectedTooth}
          onSurfaceClick={handleSurfaceClick}
          onToothClick={handleToothClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onSurfaceHover={handleSurfaceHover}
        />

        {/* Midline */}
        <div className="flex items-center gap-2 py-2 my-1">
          <div className="flex-1 h-px bg-gray-300" style={{ borderTop: '1px dashed #d1d5db' }} />
          <span className="text-[9px] font-semibold text-[#94a3b8] uppercase tracking-widest px-2">
            Midline
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <LowerArch
          teeth={odontogram.teeth}
          selectedTooth={selectedTooth}
          onSurfaceClick={handleSurfaceClick}
          onToothClick={handleToothClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onSurfaceHover={handleSurfaceHover}
        />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3">
        <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-2">
          Legend
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {ALL_TREATMENTS.map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <div
                className="w-3.5 h-3.5 rounded border border-gray-300"
                style={{ background: TREATMENT_COLORS[t] }}
              />
              <span className="text-[10px] text-[#64748b]">{TREATMENT_LABELS[t]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && tooltipSurfaceData && (
        <ToothTooltip
          toothNumber={tooltip.toothNumber}
          surface={tooltip.surface}
          surfaceData={tooltipSurfaceData}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <ToothContextMenu
          toothNumber={contextMenu.toothNumber}
          x={contextMenu.x}
          y={contextMenu.y}
          onSetMissing={() => handleToothLevelSet(contextMenu.toothNumber, 'missing')}
          onSetImplant={() => handleToothLevelSet(contextMenu.toothNumber, 'implant')}
          onAddNote={() => setDetailTooth({ toothNumber: contextMenu.toothNumber, tab: 'notes' })}
          onClearTooth={() => handleClearTooth(contextMenu.toothNumber)}
          onViewHistory={() => setDetailTooth({ toothNumber: contextMenu.toothNumber, tab: 'history' })}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Detail panel */}
      {detailTooth && detailToothState && (
        <ToothDetailPanel
          toothState={detailToothState}
          patientId={patientId}
          initialTab={detailTooth.tab}
          onUpdateNotes={(notes) => updateNotes(detailTooth.toothNumber, notes)}
          onLinkCDT={(code) => linkCDT(detailTooth.toothNumber, code)}
          onUnlinkCDT={(code) => unlinkCDT(detailTooth.toothNumber, code)}
          onClose={() => setDetailTooth(null)}
        />
      )}
    </div>
  );
}
