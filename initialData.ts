/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatientProfile } from './types';

export const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: "pat-carbamazepine",
    hn: "HN-2026-0819",
    nationalId: "1-1009-87452-92-1",
    name: "Mr. Somchai Devakul",
    gender: "Male",
    birthDate: "1984-08-15",
    bloodGroup: "O+",
    phone: "+66 81-555-0192",
    status: "Pending", // Needs pharmacist approval
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    allergies: [
      {
        id: "all-001",
        allergen: "Carbamazepine",
        severity: "Life-threatening",
        manifestations: [
          "Stevens-Johnson Syndrome (SJS)",
          "Toxic Epidermal Necrolysis (TEN)",
          "Mucosal Erosion (Oral & Ocular)"
        ],
        reactionType: "Type IV Delayed Hypersensitivity (SCAR)",
        geneticBiomarker: "HLA-B*15:02 Positive",
        dateOfOnset: "2026-05-12",
        crossReactiveDrugs: [
          "Oxcarbazepine",
          "Phenytoin",
          "Phenobarbital",
          "Lamotrigine"
        ],
        alternativeDrugs: [
          "Sodium Valproate",
          "Gabapentin",
          "Levetiracetam",
          "Topiramate"
        ],
        clinicalNotes: "Patient developed macular erythema which rapidly progressed to blistering, epidermal detachment, and severe oral mucosal sloughing 2 weeks after initiating Carbamazepine 200mg daily. Pharmacogenomic typing confirmed HLA-B*15:02 positivity. Aromatic anticonvulsants are strictly contraindicated due to high cross-reactivity risk."
      }
    ]
  },
  {
    id: "pat-allopurinol",
    hn: "HN-2024-1102",
    nationalId: "3-1205-99812-44-3",
    name: "Mrs. Amara Siriphan",
    gender: "Female",
    birthDate: "1968-11-30",
    bloodGroup: "B-",
    phone: "+66 89-444-9021",
    status: "Approved",
    approvedBy: "Kiatisak Pravat, R.Ph.",
    approvedLicense: "PH-8743",
    approvedHospital: "Siriraj University Hospital, Bangkok",
    approvalDate: "2026-04-10",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    allergies: [
      {
        id: "all-002",
        allergen: "Allopurinol",
        severity: "Severe",
        manifestations: [
          "DRESS Syndrome",
          "Eosinophilia (AEC > 1500/mcL)",
          "Exfoliative Dermatitis",
          "Acute Kidney Injury"
        ],
        reactionType: "Drug Reaction with Eosinophilia and Systemic Symptoms",
        geneticBiomarker: "HLA-B*58:01 Positive",
        dateOfOnset: "2026-03-22",
        crossReactiveDrugs: [
          "Febuxostat"
        ],
        alternativeDrugs: [
          "Benzbromarone",
          "Probenecid",
          "Colchicine"
        ],
        clinicalNotes: "Developed fever, generalized morbilliform rash, facial edema, and lymphadenopathy 4 weeks after starting Allopurinol 100mg/day for chronic gout. Serum creatinine spiked to 2.4 mg/dL. Genotyping positive for HLA-B*58:01. Avoid Febuxostat; recommend Benzbromarone for urate-lowering if renal function permits."
      }
    ]
  },
  {
    id: "pat-penicillin",
    hn: "HN-2025-0144",
    nationalId: "5-9032-00441-12-8",
    name: "Mr. Johnathan Doe",
    gender: "Male",
    birthDate: "1991-04-05",
    bloodGroup: "A+",
    phone: "+66 82-777-1049",
    status: "Approved",
    approvedBy: "Nattaporn Tang, R.Ph.",
    approvedLicense: "PH-9921",
    approvedHospital: "Chulalongkorn Memorial Hospital, Bangkok",
    approvalDate: "2026-01-15",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    allergies: [
      {
        id: "all-003",
        allergen: "Penicillin G",
        severity: "Severe",
        manifestations: [
          "Anaphylactic Shock",
          "Urticaria (Hives)",
          "Laryngeal Edema",
          "Hypotension"
        ],
        reactionType: "Type I Immediate IgE-Mediated Hypersensitivity",
        geneticBiomarker: "Not Applicable (Skin Prick Test Positive)",
        dateOfOnset: "2025-12-25",
        crossReactiveDrugs: [
          "Amoxicillin",
          "Ampicillin",
          "Cephalexin (1st Gen Cephalosporin)"
        ],
        alternativeDrugs: [
          "Azithromycin",
          "Clarithromycin",
          "Clindamycin",
          "Levofloxacin"
        ],
        clinicalNotes: "Developed acute bronchospasm, generalized hives, and blood pressure drop to 80/50 mmHg within 15 minutes of receiving intravenous Penicillin G. Required 2 doses of intramuscular Epinephrine and airway support. Strict avoidance of all Penicillins. Mild 1st-generation cephalosporin cross-reactivity is estimated at 3-5%, but strict avoidance is recommended."
      }
    ]
  }
];

// Presets for clinical helper
export const PRESETS = {
  allergens: [
    "Carbamazepine",
    "Allopurinol",
    "Penicillin G",
    "Amoxicillin",
    "Phenytoin",
    "Lamotrigine",
    "Sulfamethoxazole",
    "Abacavir",
    "Nevirapine",
    "Dapsone",
    "Ibuprofen"
  ],
  manifestations: [
    "Stevens-Johnson Syndrome (SJS)",
    "Toxic Epidermal Necrolysis (TEN)",
    "DRESS Syndrome",
    "Anaphylactic Shock",
    "Angioedema",
    "Urticaria (Hives)",
    "Maculopapular Rash",
    "Acute Generalized Exanthematous Pustulosis (AGEP)",
    "Bronchospasm",
    "Fixed Drug Eruption"
  ],
  reactionTypes: [
    "Type IV Delayed Hypersensitivity (SCAR)",
    "Type I Immediate IgE-Mediated Hypersensitivity",
    "Type II Cytotoxic Reaction",
    "Type III Immune Complex-Mediated Reaction"
  ],
  geneticBiomarkers: [
    "HLA-B*15:02 Positive",
    "HLA-B*58:01 Positive",
    "HLA-B*57:01 Positive",
    "HLA-A*31:01 Positive",
    "HLA-B*15:02 Negative",
    "HLA-B*58:01 Negative",
    "HLA-B*57:01 Negative",
    "Not Applicable (Serological/Clinical)"
  ]
};

// Automatic clinical matching to help pharmacists auto-fill
export function getClinicalDecisionSupport(allergen: string, geneticBiomarker: string) {
  const normAllergen = allergen.trim().toLowerCase();
  const normBiomarker = geneticBiomarker.trim().toLowerCase();

  if (normAllergen.includes("carbamazepine") || normAllergen === "cbz") {
    return {
      suggestedSeverity: "Life-threatening" as const,
      suggestedReactionType: "Type IV Delayed Hypersensitivity (SCAR)",
      suggestedManifestations: ["Stevens-Johnson Syndrome (SJS)", "Toxic Epidermal Necrolysis (TEN)"],
      suggestedCrossReactive: ["Oxcarbazepine", "Phenytoin", "Phenobarbital", "Lamotrigine"],
      suggestedAlternatives: ["Sodium Valproate", "Gabapentin", "Levetiracetam", "Pregabalin"],
      warning: "ALERT: Carbamazepine carries a highly elevated risk of SJS/TEN in HLA-B*15:02 positive patients. Avoid other aromatic antiepileptics as cross-reactivity is 40-80%."
    };
  }

  if (normAllergen.includes("allopurinol")) {
    return {
      suggestedSeverity: "Severe" as const,
      suggestedReactionType: "Drug Reaction with Eosinophilia and Systemic Symptoms (DRESS)",
      suggestedManifestations: ["DRESS Syndrome", "Exfoliative Dermatitis", "Acute Kidney Injury"],
      suggestedCrossReactive: ["Febuxostat"],
      suggestedAlternatives: ["Benzbromarone", "Probenecid", "Colchicine"],
      warning: "ALERT: Allopurinol-induced severe cutaneous adverse reactions (SCAR) are strongly linked to the HLA-B*58:01 allele. Febuxostat has a potential cross-hypersensitivity risk (~20%)."
    };
  }

  if (normAllergen.includes("penicillin") || normAllergen.includes("amoxicillin")) {
    return {
      suggestedSeverity: "Severe" as const,
      suggestedReactionType: "Type I Immediate IgE-Mediated Hypersensitivity",
      suggestedManifestations: ["Anaphylactic Shock", "Urticaria (Hives)", "Angioedema", "Bronchospasm"],
      suggestedCrossReactive: ["Amoxicillin", "Ampicillin", "Piperacillin", "Cephalexin (1st Gen Cephalosporin)"],
      suggestedAlternatives: ["Azithromycin", "Clarithromycin", "Clindamycin", "Levofloxacin"],
      warning: "ALERT: Immediate IgE-mediated allergy. Potential cross-reactivity with all beta-lactams. Cephalosporin cross-allergy ranges from 1% to 5% (highest with 1st generation; very low with 3rd/4th generation)."
    };
  }

  if (normAllergen.includes("abacavir")) {
    return {
      suggestedSeverity: "Severe" as const,
      suggestedReactionType: "Abacavir Hypersensitivity Syndrome (AHS)",
      suggestedManifestations: ["Fever", "Morbilliform Rash", "Gastrointestinal Symptoms", "Dyspnea"],
      suggestedCrossReactive: [],
      suggestedAlternatives: ["Tenofovir", "Zidovudine"],
      warning: "ALERT: Abacavir hypersensitivity is strictly restricted to patients with the HLA-B*57:01 allele. Re-exposure is contraindicated and can be rapidly fatal."
    };
  }

  return null;
}
