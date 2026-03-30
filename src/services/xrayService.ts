// xrayService — in-memory X-ray CRUD with audit logging.
// ⚠️ HIPAA: Every view/upload/download/delete must be audit-logged.
//            In production: Azure Blob Storage with SAS URLs + PostgreSQL audit table.

import type { XrayImage, XrayAnnotation, XrayAuditEntry } from '../types/xray';
import { MOCK_XRAYS, MOCK_ANNOTATIONS } from '../constants/mockXrays';

// ── In-memory stores ──────────────────────────────────────────────────────────
let xrayStore: XrayImage[]        = [...MOCK_XRAYS];
let annotationStore: XrayAnnotation[] = [...MOCK_ANNOTATIONS];
let auditStore: XrayAuditEntry[]  = [];

// ── Simulated network delay ───────────────────────────────────────────────────
const delay = (ms = 150) => new Promise<void>(r => setTimeout(r, ms));

// ── Audit helper ──────────────────────────────────────────────────────────────
function logAudit(
  xrayId: string,
  action: XrayAuditEntry['action'],
  userId = 'usr-demo',
  userName = 'Dr. Sarah Chen',
): void {
  auditStore.push({
    id:        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    xrayId,
    action,
    userId,
    userName,
    timestamp: new Date().toISOString(),
  });
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Returns all X-rays for a patient, sorted newest-first.
 * Logs a 'view' audit entry.
 */
export async function getXraysForPatient(patientId: string): Promise<XrayImage[]> {
  await delay();
  const results = xrayStore
    .filter(x => x.patientId === patientId)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Audit each viewed image
  results.forEach(x => logAudit(x.id, 'view'));

  return results;
}

/**
 * Returns a single X-ray by ID.
 */
export async function getXray(id: string): Promise<XrayImage> {
  await delay();
  const xray = xrayStore.find(x => x.id === id);
  if (!xray) throw new Error(`X-ray not found: ${id}`);
  return xray;
}

/**
 * Uploads a new X-ray.
 * In mock mode creates an object URL from the File.
 * Logs an 'upload' audit entry.
 */
export async function uploadXray(
  file: File,
  metadata: Omit<XrayImage, 'id' | 'fileUrl' | 'thumbnailUrl' | 'fileSizeBytes' | 'fileName'>,
): Promise<XrayImage> {
  await delay();

  const fileUrl      = URL.createObjectURL(file);
  const thumbnailUrl = fileUrl; // same in mock mode

  const newXray: XrayImage = {
    id:            `xr-${Date.now()}`,
    fileUrl,
    thumbnailUrl,
    fileSizeBytes: file.size,
    fileName:      file.name,
    ...metadata,
  };

  xrayStore = [newXray, ...xrayStore];
  logAudit(newXray.id, 'upload');
  return newXray;
}

/**
 * Updates the notes field of an X-ray.
 * Logs an 'edit' audit entry.
 */
export async function updateXrayNotes(id: string, notes: string): Promise<XrayImage> {
  await delay();
  const idx = xrayStore.findIndex(x => x.id === id);
  if (idx === -1) throw new Error(`X-ray not found: ${id}`);

  const updated: XrayImage = { ...xrayStore[idx], notes };
  xrayStore = [...xrayStore.slice(0, idx), updated, ...xrayStore.slice(idx + 1)];
  logAudit(id, 'edit');
  return updated;
}

/**
 * Deletes an X-ray by ID.
 * Logs a 'delete' audit entry.
 */
export async function deleteXray(id: string): Promise<void> {
  await delay();
  logAudit(id, 'delete');
  xrayStore = xrayStore.filter(x => x.id !== id);
  annotationStore = annotationStore.filter(a => a.xrayId !== id);
}

// ── Annotations ───────────────────────────────────────────────────────────────

/**
 * Returns all annotations for a given X-ray.
 */
export async function getAnnotations(xrayId: string): Promise<XrayAnnotation[]> {
  await delay();
  return annotationStore.filter(a => a.xrayId === xrayId);
}

/**
 * Adds an annotation to an X-ray.
 * Logs an 'annotate' audit entry.
 */
export async function addAnnotation(
  annotation: Omit<XrayAnnotation, 'id'>,
): Promise<XrayAnnotation> {
  await delay();
  const newAnnotation: XrayAnnotation = {
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...annotation,
  };
  annotationStore = [...annotationStore, newAnnotation];
  logAudit(annotation.xrayId, 'annotate');
  return newAnnotation;
}

/**
 * Deletes an annotation by ID.
 */
export async function deleteAnnotation(id: string): Promise<void> {
  await delay();
  annotationStore = annotationStore.filter(a => a.id !== id);
}

// ── Audit log ─────────────────────────────────────────────────────────────────

/**
 * Returns the audit log for a specific X-ray.
 */
export async function getAuditLog(xrayId: string): Promise<XrayAuditEntry[]> {
  await delay();
  return auditStore
    .filter(e => e.xrayId === xrayId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
