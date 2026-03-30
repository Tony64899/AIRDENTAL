// XrayPage — Phase 7 X-ray Upload & Viewer.
// ⚠️ HIPAA: All X-ray data is PHI. Authenticated access and audit logging required.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  Columns2,
  Pencil,
  Download,
  Trash2,
} from 'lucide-react';
import { useXray }        from '../hooks/useXray';
import { useXrayViewer }  from '../hooks/useXrayViewer';
import { MOCK_PATIENTS }  from '../constants/mockPatients';
import { XrayGallery }        from '../components/xray/XrayGallery';
import { XrayViewer }         from '../components/xray/XrayViewer';
import { XrayToolbar }        from '../components/xray/XrayToolbar';
import { XrayUploader }       from '../components/xray/XrayUploader';
import { XrayMetadataPanel }  from '../components/xray/XrayMetadataPanel';
import { XrayAnnotationPanel } from '../components/xray/XrayAnnotationPanel';
import { XrayComparison }     from '../components/xray/XrayComparison';

type RightPanel = 'metadata' | 'annotation';

export default function XrayPage() {
  const [searchParams]   = useSearchParams();
  const urlPatient       = searchParams.get('patient');

  const [patientId,      setPatientId]      = useState(urlPatient ?? 'pat-1');
  const [rightPanel,     setRightPanel]     = useState<RightPanel>('metadata');
  const [showUploader,   setShowUploader]   = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [compareOpen,    setCompareOpen]    = useState(false);
  const [isFullscreen,   setIsFullscreen]   = useState(false);

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const xray = useXray(patientId);
  const viewer = useXrayViewer();

  const {
    xrays,
    annotations,
    loadState,
    selectedXray,
    selectXray,
    uploadXray,
    deleteXray,
    updateNotes,
    addAnnotation,
    deleteAnnotation,
  } = xray;

  const {
    state:         viewerState,
    setBrightness,
    setContrast,
    setZoom,
    zoomIn,
    zoomOut,
    toggleInvert,
    rotateLeft,
    rotateRight,
    setPan,
    reset,
  } = viewer;

  // Filter annotations for selected X-ray
  const selectedAnnotations = selectedXray
    ? annotations.filter(a => a.xrayId === selectedXray.id)
    : [];

  // ── Fullscreen toggle ───────────────────────────────────────────────────────
  function handleFullscreen() {
    if (!document.fullscreenElement) {
      viewerContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore when typing in inputs/textareas
    if ((e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA' ||
        (e.target as HTMLElement).tagName === 'SELECT') return;

    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-')                  zoomOut();
    if (e.key === 'i' || e.key === 'I') toggleInvert();
    if (e.key === 'r' || e.key === 'R') reset();
    if (e.key === 'Escape') {
      if (compareOpen)   setCompareOpen(false);
      if (showUploader)  setShowUploader(false);
    }
  }, [zoomIn, zoomOut, toggleInvert, reset, compareOpen, showUploader]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Download handler ────────────────────────────────────────────────────────
  function handleDownload() {
    if (!selectedXray) return;
    const a = document.createElement('a');
    a.href     = selectedXray.fileUrl;
    a.download = selectedXray.fileName;
    a.click();
  }

  // ── Delete handler ──────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!selectedXray) return;
    const confirmed = window.confirm(
      `Delete this X-ray (${selectedXray.type} — ${selectedXray.date})? This action cannot be undone.`,
    );
    if (!confirmed) return;
    await deleteXray(selectedXray.id);
  }

  // ── Current patient info ────────────────────────────────────────────────────
  const currentPatient = MOCK_PATIENTS.find(p => p.id === patientId);

  function formatDOB(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${m}/${d}/${y}`;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#050505]" ref={viewerContainerRef}>

      {/* ── Top header bar ──────────────────────────────────────────────────── */}
      <div className="bg-[#0f0f0f] border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between flex-shrink-0">

        {/* Left: title + patient selector */}
        <div className="flex items-center gap-4">
          <h1 className="text-white font-bold text-sm">X-ray Viewer</h1>

          {/* Patient selector */}
          <select
            value={patientId}
            onChange={e => {
              setPatientId(e.target.value);
              selectXray(null);
              reset();
            }}
            className="bg-[#1a1a1a] text-white text-sm border border-[#2a2a2a] rounded-lg px-3 py-1.5 outline-none focus:border-[#0891b2] cursor-pointer"
            aria-label="Select patient"
          >
            {MOCK_PATIENTS.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>

          {/* DOB */}
          {currentPatient && (
            <span className="text-[#555] text-xs">
              DOB: {formatDOB(currentPatient.dateOfBirth)}
            </span>
          )}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#888] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload
          </button>

          <button
            onClick={() => setCompareOpen(true)}
            disabled={xrays.length < 2}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#888] hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Columns2 className="w-3.5 h-3.5" />
            Compare
          </button>

          <button
            onClick={() => setRightPanel('annotation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
              rightPanel === 'annotation'
                ? 'text-[#0891b2] bg-[#0891b2]/10'
                : 'text-[#888] hover:text-white hover:bg-white/10'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Annotate
          </button>

          <button
            onClick={handleDownload}
            disabled={!selectedXray}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#888] hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>

          <button
            onClick={() => void handleDelete()}
            disabled={!selectedXray}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#888] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* ── Main body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left gallery panel ─────────────────────────────────────────────── */}
        <div className="w-52 flex-shrink-0 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-[#1a1a1a] flex-shrink-0">
            <p className="text-[10px] text-[#444] font-medium">
              {currentPatient
                ? `${currentPatient.firstName} ${currentPatient.lastName}`
                : 'Patient'}
              {' '}
              <span className="text-[#333]">· {xrays.length} X-ray{xrays.length !== 1 ? 's' : ''}</span>
            </p>
          </div>

          {/* Gallery */}
          <div className="flex-1 overflow-hidden">
            <XrayGallery
              xrays={xrays}
              selectedId={selectedXray?.id ?? null}
              onSelect={id => {
                selectXray(id);
                reset();
              }}
              isLoading={loadState === 'loading' || loadState === 'idle'}
            />
          </div>
        </div>

        {/* ── Center viewer panel ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a] relative overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <XrayViewer
              xray={selectedXray}
              viewerState={viewerState}
              annotations={selectedAnnotations}
              onPanChange={setPan}
              showAnnotations={showAnnotations}
            />
          </div>
          <XrayToolbar
            viewerState={viewerState}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onSetBrightness={setBrightness}
            onSetContrast={setContrast}
            onToggleInvert={toggleInvert}
            onRotateLeft={rotateLeft}
            onRotateRight={rotateRight}
            onReset={reset}
            onFullscreen={handleFullscreen}
            onToggleAnnotations={() => setShowAnnotations(v => !v)}
            showAnnotations={showAnnotations}
            isFullscreen={isFullscreen}
          />
        </div>

        {/* ── Right panel ──────────────────────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 bg-[#0d0d0d] border-l border-[#1a1a1a] flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-[#1a1a1a] flex-shrink-0">
            {(['metadata', 'annotation'] as RightPanel[]).map(panel => (
              <button
                key={panel}
                onClick={() => setRightPanel(panel)}
                className={[
                  'flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px capitalize',
                  rightPanel === panel
                    ? 'border-[#0891b2] text-white'
                    : 'border-transparent text-[#555] hover:text-[#888]',
                ].join(' ')}
              >
                {panel === 'metadata' ? 'Metadata' : 'Annotations'}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-3">
            {rightPanel === 'metadata' ? (
              <XrayMetadataPanel
                xray={selectedXray}
                onUpdateNotes={updateNotes}
              />
            ) : (
              <XrayAnnotationPanel
                xray={selectedXray}
                annotations={annotations}
                onAdd={addAnnotation}
                onDelete={deleteAnnotation}
              />
            )}
          </div>
        </div>

      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showUploader && (
        <XrayUploader
          patientId={patientId}
          onUpload={async (file, meta) => {
            await uploadXray(file, meta);
            setShowUploader(false);
          }}
          onClose={() => setShowUploader(false)}
        />
      )}

      {compareOpen && (
        <XrayComparison
          xrays={xrays}
          primaryId={selectedXray?.id ?? null}
          onClose={() => setCompareOpen(false)}
        />
      )}

    </div>
  );
}
