// XrayUploader — drag-and-drop X-ray upload modal.
// ⚠️ HIPAA: Files are patient PHI. Use signed upload URLs in production.

import { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle } from 'lucide-react';
import type { XrayImage, XrayType } from '../../types/xray';

interface XrayUploaderProps {
  patientId: string;
  onUpload:  (file: File, meta: Omit<XrayImage, 'id' | 'fileUrl' | 'thumbnailUrl' | 'fileSizeBytes' | 'fileName'>) => Promise<void>;
  onClose:   () => void;
}

const XRAY_TYPES: XrayType[] = ['PA', 'BW', 'Pano', 'FMX', 'Ceph'];

const PROVIDERS = [
  { id: 'prov-1', name: 'Dr. Sarah Chen' },
  { id: 'prov-2', name: 'Dr. Michael Torres' },
  { id: 'prov-3', name: 'Dr. Emily White' },
  { id: 'prov-4', name: 'Dr. James Park' },
];

export function XrayUploader({ patientId, onUpload, onClose }: XrayUploaderProps) {
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver]   = useState(false);
  const [file,     setFile]       = useState<File | null>(null);
  const [preview,  setPreview]    = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [success,   setSuccess]   = useState(false);

  // Form fields
  const [xrayType,    setXrayType]    = useState<XrayType>('PA');
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 10));
  const [providerId,  setProviderId]  = useState('prov-1');
  const [toothInput,  setToothInput]  = useState('');
  const [notes,       setNotes]       = useState('');

  function processFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    for (let p = 0; p <= 90; p += 10) {
      await new Promise<void>(r => setTimeout(r, 80));
      setProgress(p);
    }

    await onUpload(file, {
      patientId,
      type:         xrayType,
      date,
      providerId,
      toothNumbers: toothInput
        ? toothInput.split(',').map(n => parseInt(n.trim(), 10)).filter(Boolean)
        : [],
      notes: notes || undefined,
    });

    setProgress(100);
    setSuccess(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0f172a]">Upload X-ray</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-gray-100 transition-colors"
            aria-label="Close uploader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Success state */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <p className="text-lg font-semibold text-[#0f172a]">X-ray uploaded successfully</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#0891b2] text-white rounded-xl font-semibold text-sm hover:bg-[#0e7490] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Drop zone or preview */}
              {!file ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={[
                    'border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors',
                    dragOver
                      ? 'border-[#0891b2] bg-[#e0f2fe]'
                      : 'border-gray-200 hover:border-[#0891b2] hover:bg-gray-50',
                  ].join(' ')}
                >
                  <UploadCloud className="w-12 h-12 text-[#94a3b8] mb-3" />
                  <p className="text-sm font-medium text-[#0f172a]">Drop X-ray here or click to browse</p>
                  <p className="text-xs text-[#94a3b8] mt-1">Supported: JPG, PNG — DICOM support coming soon</p>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="bg-[#0a0a0a] rounded-xl overflow-hidden flex items-center justify-center h-40">
                    <img
                      src={preview ?? ''}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#64748b]">{file.name}</span>
                    <button
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="text-xs text-[#94a3b8] hover:text-red-500 transition-colors"
                    >
                      Change file
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.dcm"
                hidden
                onChange={handleFileChange}
              />

              {/* Form fields (shown after file selected) */}
              {file && (
                <div className="space-y-4 mt-4">

                  {/* X-ray Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1.5">X-ray Type</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {XRAY_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setXrayType(t)}
                          className={[
                            'px-3 py-1 rounded-lg text-xs font-semibold transition-colors border',
                            xrayType === t
                              ? 'bg-[#0891b2] text-white border-[#0891b2]'
                              : 'text-[#64748b] border-gray-200 hover:border-[#0891b2] hover:text-[#0891b2]',
                          ].join(' ')}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1.5" htmlFor="xray-date">
                      Date
                    </label>
                    <input
                      id="xray-date"
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] outline-none"
                    />
                  </div>

                  {/* Provider */}
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1.5" htmlFor="xray-provider">
                      Provider
                    </label>
                    <select
                      id="xray-provider"
                      value={providerId}
                      onChange={e => setProviderId(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] outline-none"
                    >
                      {PROVIDERS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tooth Numbers */}
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1.5" htmlFor="xray-tooth">
                      Tooth Number(s)
                    </label>
                    <input
                      id="xray-tooth"
                      type="text"
                      value={toothInput}
                      onChange={e => setToothInput(e.target.value)}
                      placeholder="e.g. 30 or 1,2,3 — leave blank for full arch"
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1.5" htmlFor="xray-notes">
                      Notes
                    </label>
                    <textarea
                      id="xray-notes"
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Clinical notes..."
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-[#0891b2]/30 focus:border-[#0891b2] outline-none"
                    />
                  </div>

                  {/* Progress bar */}
                  {uploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-[#0891b2] h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && file && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2.5 bg-[#0891b2] text-white rounded-xl font-semibold text-sm hover:bg-[#0e7490] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? `Uploading ${progress}%…` : 'Upload X-ray'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
