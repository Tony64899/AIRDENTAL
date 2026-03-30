// CDT Code reference — most common dental procedure codes.
// Source: American Dental Association CDT (Current Dental Terminology).
// Phase 5: Odontogram CDT code picker uses this for auto-complete.
// ⚠️ HIPAA: CDT codes used in treatment records are PHI in context.

export interface CDTCode {
  code:        string;   // e.g. "D2391"
  description: string;   // e.g. "Resin composite – one surface, posterior"
  category:    string;   // e.g. "Restorative"
}

export const CDT_CODES: CDTCode[] = [
  // ── Diagnostic ────────────────────────────────────────────────────────────
  { code: 'D0120', description: 'Periodic oral evaluation',                                        category: 'Diagnostic' },
  { code: 'D0140', description: 'Limited oral evaluation',                                         category: 'Diagnostic' },
  { code: 'D0150', description: 'Comprehensive oral evaluation',                                   category: 'Diagnostic' },
  { code: 'D0210', description: 'Full mouth series (FMX) radiographic images',                     category: 'Diagnostic' },
  { code: 'D0220', description: 'Periapical x-ray, first image',                                   category: 'Diagnostic' },
  { code: 'D0230', description: 'Periapical x-ray, each additional image',                         category: 'Diagnostic' },
  { code: 'D0270', description: 'Bitewing x-ray, single image',                                    category: 'Diagnostic' },
  { code: 'D0272', description: 'Bitewing x-ray, two images',                                      category: 'Diagnostic' },
  { code: 'D0274', description: 'Bitewing x-ray, four images',                                     category: 'Diagnostic' },
  { code: 'D0330', description: 'Panoramic radiographic image',                                    category: 'Diagnostic' },
  { code: 'D0460', description: 'Pulp vitality test',                                              category: 'Diagnostic' },

  // ── Preventive ────────────────────────────────────────────────────────────
  { code: 'D1110', description: 'Adult prophylaxis (cleaning)',                                    category: 'Preventive' },
  { code: 'D1120', description: 'Child prophylaxis (cleaning)',                                    category: 'Preventive' },
  { code: 'D1206', description: 'Topical fluoride varnish',                                        category: 'Preventive' },
  { code: 'D1208', description: 'Topical fluoride (non-varnish)',                                  category: 'Preventive' },
  { code: 'D1351', description: 'Sealant — per tooth',                                             category: 'Preventive' },
  { code: 'D1352', description: 'Preventive resin restoration (sealant with preventive resin)',    category: 'Preventive' },
  { code: 'D1510', description: 'Space maintainer, fixed, unilateral',                            category: 'Preventive' },

  // ── Restorative ───────────────────────────────────────────────────────────
  { code: 'D2140', description: 'Amalgam, 1 surface, primary or permanent',                       category: 'Restorative' },
  { code: 'D2150', description: 'Amalgam, 2 surfaces, primary or permanent',                      category: 'Restorative' },
  { code: 'D2160', description: 'Amalgam, 3 surfaces, primary or permanent',                      category: 'Restorative' },
  { code: 'D2161', description: 'Amalgam, 4+ surfaces, primary or permanent',                     category: 'Restorative' },
  { code: 'D2330', description: 'Resin composite, 1 surface, anterior',                           category: 'Restorative' },
  { code: 'D2331', description: 'Resin composite, 2 surfaces, anterior',                          category: 'Restorative' },
  { code: 'D2332', description: 'Resin composite, 3 surfaces, anterior',                          category: 'Restorative' },
  { code: 'D2335', description: 'Resin composite, 4+ surfaces or incisal angle, anterior',        category: 'Restorative' },
  { code: 'D2391', description: 'Resin composite, 1 surface, posterior',                          category: 'Restorative' },
  { code: 'D2392', description: 'Resin composite, 2 surfaces, posterior',                         category: 'Restorative' },
  { code: 'D2393', description: 'Resin composite, 3 surfaces, posterior',                         category: 'Restorative' },
  { code: 'D2394', description: 'Resin composite, 4+ surfaces, posterior',                        category: 'Restorative' },
  { code: 'D2710', description: 'Crown, resin-based composite (indirect)',                        category: 'Restorative' },
  { code: 'D2712', description: 'Crown, \u00be resin-based composite (indirect)',                 category: 'Restorative' },
  { code: 'D2720', description: 'Crown, resin with high noble metal',                             category: 'Restorative' },
  { code: 'D2740', description: 'Crown, porcelain/ceramic substrate',                             category: 'Restorative' },
  { code: 'D2750', description: 'Crown, porcelain fused to high noble metal',                     category: 'Restorative' },
  { code: 'D2780', description: 'Crown, \u00be cast high noble metal',                            category: 'Restorative' },
  { code: 'D2930', description: 'Prefabricated stainless steel crown, primary',                   category: 'Restorative' },
  { code: 'D2932', description: 'Prefabricated resin crown',                                      category: 'Restorative' },
  { code: 'D2950', description: 'Core buildup, including any pins when required',                 category: 'Restorative' },
  { code: 'D2951', description: 'Pin retention, per tooth',                                       category: 'Restorative' },
  { code: 'D2980', description: 'Crown repair, by report',                                        category: 'Restorative' },

  // ── Endodontics ───────────────────────────────────────────────────────────
  { code: 'D3110', description: 'Pulp cap, direct (excluding final restoration)',                  category: 'Endodontics' },
  { code: 'D3120', description: 'Pulp cap, indirect (excluding final restoration)',                category: 'Endodontics' },
  { code: 'D3220', description: 'Therapeutic pulpotomy',                                          category: 'Endodontics' },
  { code: 'D3310', description: 'Endodontic therapy, anterior tooth',                             category: 'Endodontics' },
  { code: 'D3320', description: 'Endodontic therapy, premolar tooth',                             category: 'Endodontics' },
  { code: 'D3330', description: 'Endodontic therapy, molar tooth',                                category: 'Endodontics' },
  { code: 'D3346', description: 'Retreatment of previous root canal, anterior',                   category: 'Endodontics' },
  { code: 'D3410', description: 'Apicoectomy, anterior',                                          category: 'Endodontics' },
  { code: 'D3421', description: 'Apicoectomy, premolar (first root)',                              category: 'Endodontics' },
  { code: 'D3430', description: 'Apicoectomy, molar (first root)',                                category: 'Endodontics' },

  // ── Periodontics ──────────────────────────────────────────────────────────
  { code: 'D4210', description: 'Gingivectomy or gingivoplasty, four or more contiguous teeth',   category: 'Periodontics' },
  { code: 'D4211', description: 'Gingivectomy or gingivoplasty, one to three teeth',              category: 'Periodontics' },
  { code: 'D4341', description: 'Periodontal scaling and root planing, four or more teeth per quadrant', category: 'Periodontics' },
  { code: 'D4342', description: 'Periodontal scaling and root planing, one to three teeth per quadrant', category: 'Periodontics' },
  { code: 'D4355', description: 'Full mouth debridement',                                         category: 'Periodontics' },
  { code: 'D4910', description: 'Periodontal maintenance',                                        category: 'Periodontics' },

  // ── Prosthodontics ────────────────────────────────────────────────────────
  { code: 'D5110', description: 'Complete denture, maxillary',                                    category: 'Prosthodontics' },
  { code: 'D5120', description: 'Complete denture, mandibular',                                   category: 'Prosthodontics' },
  { code: 'D5130', description: 'Immediate denture, maxillary',                                   category: 'Prosthodontics' },
  { code: 'D5213', description: 'Maxillary partial denture, cast metal framework',                category: 'Prosthodontics' },
  { code: 'D5214', description: 'Mandibular partial denture, cast metal framework',               category: 'Prosthodontics' },
  { code: 'D5730', description: 'Reline complete maxillary denture (chairside)',                  category: 'Prosthodontics' },

  // ── Implants ──────────────────────────────────────────────────────────────
  { code: 'D6010', description: 'Surgical placement of implant body',                             category: 'Implants' },
  { code: 'D6056', description: 'Prefabricated abutment',                                         category: 'Implants' },
  { code: 'D6058', description: 'Implant/abutment supported crown, ceramic',                      category: 'Implants' },
  { code: 'D6065', description: 'Implant supported metal crown',                                  category: 'Implants' },
  { code: 'D6066', description: 'Implant supported PFM crown',                                    category: 'Implants' },
  { code: 'D6067', description: 'Implant supported metal crown (high noble)',                     category: 'Implants' },
  { code: 'D6075', description: 'Implant supported retainer for ceramic FPD',                     category: 'Implants' },

  // ── Oral Surgery ──────────────────────────────────────────────────────────
  { code: 'D7140', description: 'Extraction, erupted tooth or exposed root',                      category: 'Oral Surgery' },
  { code: 'D7210', description: 'Extraction, erupted tooth requiring elevation of mucoperiosteal flap', category: 'Oral Surgery' },
  { code: 'D7230', description: 'Removal of impacted tooth, soft tissue',                         category: 'Oral Surgery' },
  { code: 'D7240', description: 'Removal of impacted tooth, completely bony',                     category: 'Oral Surgery' },
  { code: 'D7241', description: 'Removal of impacted tooth, completely bony with unusual surgical complications', category: 'Oral Surgery' },
  { code: 'D7310', description: 'Alveoloplasty in conjunction with extractions',                  category: 'Oral Surgery' },
  { code: 'D7510', description: 'Incision and drainage of abscess',                               category: 'Oral Surgery' },

  // ── Orthodontics ──────────────────────────────────────────────────────────
  { code: 'D8010', description: 'Limited orthodontic treatment, primary dentition',               category: 'Orthodontics' },
  { code: 'D8060', description: 'Interceptive orthodontic treatment, mixed dentition',            category: 'Orthodontics' },
  { code: 'D8080', description: 'Comprehensive orthodontic treatment, adolescent',                category: 'Orthodontics' },
  { code: 'D8090', description: 'Comprehensive orthodontic treatment, adult',                     category: 'Orthodontics' },

  // ── Adjunctive ────────────────────────────────────────────────────────────
  { code: 'D9110', description: 'Palliative treatment of dental pain',                            category: 'Adjunctive' },
  { code: 'D9222', description: 'Deep sedation/general anesthesia',                               category: 'Adjunctive' },
  { code: 'D9930', description: 'Treatment of complications',                                     category: 'Adjunctive' },
];

// Unique sorted list of categories
export const CDT_CATEGORIES: string[] = [
  ...new Set(CDT_CODES.map(c => c.category)),
].sort();

// O(1) lookup by code
export const CDT_BY_CODE: Record<string, CDTCode> = Object.fromEntries(
  CDT_CODES.map(c => [c.code, c]),
);
