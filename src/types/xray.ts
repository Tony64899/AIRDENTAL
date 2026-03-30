// xray.ts — Type definitions for the X-ray Viewer module (Phase 7).
// ⚠️ HIPAA: X-ray images and metadata are PHI. Authenticated access only.
//            Every view, upload, download, and delete must be audit-logged.

export type XrayType = 'PA' | 'BW' | 'Pano' | 'FMX' | 'Ceph';
// PA=Periapical, BW=Bitewing, Pano=Panoramic, FMX=Full-mouth series, Ceph=Cephalometric
// CBCT is Future scope.

export interface XrayImage {
  id:            string;
  patientId:     string;
  fileUrl:       string;        // in production: Azure Blob SAS URL
  thumbnailUrl:  string;        // smaller version for gallery
  type:          XrayType;
  toothNumbers:  number[];      // [] = full arch (Pano/FMX)
  quadrant?:     'UR' | 'UL' | 'LR' | 'LL' | 'full'; // UR=upper right etc.
  providerId:    string;
  date:          string;        // ISO YYYY-MM-DD
  notes?:        string;
  fileName:      string;        // original file name
  fileSizeBytes: number;
}

export type AnnotationType = 'text' | 'arrow' | 'measurement';

export interface XrayAnnotation {
  id:         string;
  xrayId:     string;
  type:       AnnotationType;
  x:          number;    // 0–100 (percentage of image width)
  y:          number;    // 0–100 (percentage of image height)
  x2?:        number;    // end point for arrow/measurement
  y2?:        number;
  label:      string;
  createdBy:  string;
  createdAt:  string;    // ISO datetime
}

export interface XrayAuditEntry {
  id:        string;
  xrayId:    string;
  action:    'view' | 'upload' | 'download' | 'delete' | 'annotate' | 'edit';
  userId:    string;
  userName:  string;
  timestamp: string;
}

// Viewer display state (managed by useXrayViewer)
export interface XrayViewerState {
  brightness: number;   // 0–200, default 100
  contrast:   number;   // 0–200, default 100
  invert:     boolean;
  zoom:       number;   // 0.25–5, default 1
  rotation:   number;   // 0 | 90 | 180 | 270
  panX:       number;   // pixels
  panY:       number;
}
