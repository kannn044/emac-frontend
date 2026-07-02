/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AllergyRecord {
  id: string;
  allergen: string;          // e.g., Carbamazepine
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
  manifestations: string[];  // e.g., ["Stevens-Johnson Syndrome (SJS)", "Toxic Epidermal Necrolysis (TEN)"]
  reactionType: string;      // e.g., "Type IV Delayed Hypersensitivity (SCAR)"
  geneticBiomarker: string;  // e.g., "HLA-B*15:02 Positive"
  dateOfOnset: string;
  crossReactiveDrugs: string[]; // Drugs to avoid (e.g., Oxcarbazepine, Phenytoin)
  alternativeDrugs: string[];   // Safe alternative medications
  clinicalNotes: string;
}

export interface PatientProfile {
  id: string;
  hn: string;                // Hospital Number
  nationalId: string;        // ID / Passport Number
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  birthDate: string;
  bloodGroup: string;
  phone: string;
  allergies: AllergyRecord[];
  status: 'Draft' | 'Pending' | 'Approved';
  approvedBy?: string;       // Pharmacist Name
  approvedLicense?: string;  // Pharmacist License No.
  approvedHospital?: string; // Verification Facility
  approvalDate?: string;     // Date of Approval
  photoUrl?: string;         // Mock avatar
}
