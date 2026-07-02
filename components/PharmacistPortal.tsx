/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Edit, 
  User, 
  FileText, 
  Activity, 
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  Award,
  AlertOctagon,
  Eye,
  Trash
} from 'lucide-react';
import { PatientProfile, AllergyRecord } from '../types';
import { PRESETS, getClinicalDecisionSupport } from '../initialData';

interface PharmacistPortalProps {
  patients: PatientProfile[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  onUpdatePatient: (patient: PatientProfile) => void;
  onApprovePatient: (id: string, pharmacistName: string, license: string, hospital: string) => void;
  onAddPatient: (newPatient: PatientProfile) => void;
  onResetAll: () => void;
}

export const PharmacistPortal: React.FC<PharmacistPortalProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onUpdatePatient,
  onApprovePatient,
  onAddPatient,
  onResetAll
}) => {
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Form states for the selected patient
  const [name, setName] = useState('');
  const [hn, setHn] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [birthDate, setBirthDate] = useState('');

  // Primary allergy form states
  const [allergen, setAllergen] = useState('');
  const [severity, setSeverity] = useState<AllergyRecord['severity']>('Severe');
  const [reactionType, setReactionType] = useState('');
  const [geneticBiomarker, setGeneticBiomarker] = useState('');
  const [manifestationsText, setManifestationsText] = useState('');
  const [crossReactiveText, setCrossReactiveText] = useState('');
  const [alternativeText, setAlternativeText] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [dateOfOnset, setDateOfOnset] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Clinical Decision Support warnings
  const [cdsSuggestion, setCdsSuggestion] = useState<any>(null);

  // Digital Signature Modal
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [pharmacistName, setPharmacistName] = useState('Jane Watson, Pharm.D., R.Ph.');
  const [licenseNumber, setLicenseNumber] = useState('PH-7740');
  const [hospitalName, setHospitalName] = useState('Siriraj University Hospital, Bangkok');

  // Load selected patient data into form states
  useEffect(() => {
    if (selectedPatient) {
      setName(selectedPatient.name);
      setHn(selectedPatient.hn);
      setNationalId(selectedPatient.nationalId);
      setPhone(selectedPatient.phone);
      setBloodGroup(selectedPatient.bloodGroup);
      setGender(selectedPatient.gender);
      setBirthDate(selectedPatient.birthDate);

      const allergy = selectedPatient.allergies[0];
      if (allergy) {
        setAllergen(allergy.allergen);
        setSeverity(allergy.severity);
        setReactionType(allergy.reactionType);
        setGeneticBiomarker(allergy.geneticBiomarker);
        setManifestationsText(allergy.manifestations.join(', '));
        setCrossReactiveText(allergy.crossReactiveDrugs.join(', '));
        setAlternativeText(allergy.alternativeDrugs.join(', '));
        setClinicalNotes(allergy.clinicalNotes);
        setDateOfOnset(allergy.dateOfOnset);
      } else {
        setAllergen('');
        setSeverity('Severe');
        setReactionType('');
        setGeneticBiomarker('');
        setManifestationsText('');
        setCrossReactiveText('');
        setAlternativeText('');
        setClinicalNotes('');
        setDateOfOnset('');
      }
    }
  }, [selectedPatientId, selectedPatient]);

  // Compute Clinical Decision Support (CDS) based on active allergen and biomarker
  useEffect(() => {
    if (allergen) {
      const cds = getClinicalDecisionSupport(allergen, geneticBiomarker);
      setCdsSuggestion(cds);
    } else {
      setCdsSuggestion(null);
    }
  }, [allergen, geneticBiomarker]);

  // Helper to apply CDS recommendations with 1 click
  const handleApplyCds = () => {
    if (cdsSuggestion) {
      setSeverity(cdsSuggestion.suggestedSeverity);
      setReactionType(cdsSuggestion.suggestedReactionType);
      
      // Merge manifestations if not already filled
      const uniqueManifests = Array.from(new Set([
        ...cdsSuggestion.suggestedManifestations,
        ...manifestationsText.split(',').map(s => s.trim()).filter(Boolean)
      ]));
      setManifestationsText(uniqueManifests.join(', '));

      // Fill cross-reactive and alternative drugs
      setCrossReactiveText(cdsSuggestion.suggestedCrossReactive.join(', '));
      setAlternativeText(cdsSuggestion.suggestedAlternatives.join(', '));

      // Append clinical warning notes
      const notesPrefix = `[CDS Advisory Alert: ${cdsSuggestion.warning}] `;
      if (!clinicalNotes.includes("CDS Advisory")) {
        setClinicalNotes(prev => notesPrefix + (prev || ''));
      }
    }
  };

  // Quick preset click handlers
  const handleAddManifestationPreset = (preset: string) => {
    const current = manifestationsText.split(',').map(s => s.trim()).filter(Boolean);
    if (!current.includes(preset)) {
      setManifestationsText([...current, preset].join(', '));
    }
  };

  const handleAllergenPresetSelect = (preset: string) => {
    setAllergen(preset);
  };

  const handleBiomarkerPresetSelect = (preset: string) => {
    setGeneticBiomarker(preset);
  };

  // Form submission / Patient profile update
  const handleSaveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !hn || !allergen) {
      alert("Please specify Patient Name, Hospital Number, and Drug Allergen.");
      return;
    }

    const updatedAllergies: AllergyRecord[] = [
      {
        id: selectedPatient.allergies[0]?.id || crypto.randomUUID(),
        allergen,
        severity,
        manifestations: manifestationsText.split(',').map(s => s.trim()).filter(Boolean),
        reactionType,
        geneticBiomarker,
        dateOfOnset,
        crossReactiveDrugs: crossReactiveText.split(',').map(s => s.trim()).filter(Boolean),
        alternativeDrugs: alternativeText.split(',').map(s => s.trim()).filter(Boolean),
        clinicalNotes
      }
    ];

    const updatedPatient: PatientProfile = {
      ...selectedPatient,
      name,
      hn,
      nationalId,
      phone,
      bloodGroup,
      gender,
      birthDate,
      allergies: updatedAllergies,
      status: selectedPatient.status === 'Approved' ? 'Pending' : selectedPatient.status // Re-queue if approved card was modified
    };

    onUpdatePatient(updatedPatient);
  };

  // Signature validation and approval execution
  const handleSignAndApprove = () => {
    if (!pharmacistName.trim() || !licenseNumber.trim() || !hospitalName.trim()) {
      alert("Please fill in all licensing and location fields to authorize this record.");
      return;
    }

    // First, save current form changes
    handleSaveDraft();

    // Perform approval callback
    onApprovePatient(selectedPatient.id, pharmacistName, licenseNumber, hospitalName);
    setIsSignatureModalOpen(false);
  };

  // Add a new empty patient card for demonstration
  const handleCreateNewPatient = () => {
    const newId = `pat-${Date.now()}`;
    const newPatient: PatientProfile = {
      id: newId,
      hn: `HN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      nationalId: "1-2345-" + Math.floor(10000 + Math.random() * 90000) + "-12-1",
      name: "New Guest Patient",
      gender: "Female",
      birthDate: "1995-02-18",
      bloodGroup: "A-",
      phone: "+66 85-123-4567",
      status: "Draft",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      allergies: [
        {
          id: `all-${Date.now()}`,
          allergen: "Carbamazepine",
          severity: "Severe",
          manifestations: ["Maculopapular Rash"],
          reactionType: "Type IV Delayed Hypersensitivity (SCAR)",
          geneticBiomarker: "HLA-B*15:02 Positive",
          dateOfOnset: new Date().toISOString().split('T')[0],
          crossReactiveDrugs: ["Oxcarbazepine"],
          alternativeDrugs: ["Gabapentin"],
          clinicalNotes: "Testing pharmacogenomic profiles."
        }
      ]
    };
    onAddPatient(newPatient);
    onSelectPatient(newId);
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(p => {
    const term = searchQuery.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(term);
    const matchesHn = p.hn.toLowerCase().includes(term);
    const matchesAllergen = p.allergies.some(a => a.allergen.toLowerCase().includes(term));
    return matchesName || matchesHn || matchesAllergen;
  });

  return (
    <div className="flex flex-col h-full bg-[#0b0c0e] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* 1. Header Area with Dashboard Details */}
      <div className="px-6 py-4 bg-[#111215] border-b border-zinc-800/80 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              eMAC Medical Registry
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                Staff Portal
              </span>
            </h2>
            <p className="text-xs text-zinc-500">Clinical Verification & Pharmacogenomics Registry</p>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onResetAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all"
            title="Restore default clinical demo patients"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
          
          <button 
            onClick={handleCreateNewPatient}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Patient Card</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workspace Layout: Side Queue + Editing Canvas */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Left Side: Patient Search and Queue List */}
        <div className="w-full md:w-80 border-r border-zinc-800/80 flex flex-col bg-[#0c0d10] shrink-0">
          
          {/* Search bar */}
          <div className="p-4 border-b border-zinc-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search by name, HN, drug..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 transition-all font-mono"
              />
            </div>
          </div>

          {/* Queue Title */}
          <div className="px-4 py-2.5 bg-[#101114] border-b border-zinc-800/30 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Verified Queue ({filteredPatients.length})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Queue Patient Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
            {filteredPatients.map(p => {
              const allergenInfo = p.allergies[0];
              const isSelected = p.id === selectedPatientId;
              
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className={`w-full text-left p-4 flex items-start space-x-3 transition-all outline-none ${isSelected ? 'bg-indigo-950/25 border-l-2 border-indigo-500' : 'hover:bg-zinc-900/40'}`}
                >
                  <img 
                    src={p.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800 border border-zinc-800 shrink-0 shadow-inner"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-xs font-bold text-zinc-200 truncate leading-tight">{p.name}</p>
                      
                      {/* Approved or Pending status */}
                      {p.status === 'Approved' ? (
                        <span className="shrink-0 p-0.5 text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20" title="Pharmacist Approved">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <span className="shrink-0 p-0.5 text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20 animate-pulse" title="Needs Approval">
                          <Clock className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-zinc-500 font-mono leading-none mt-1">HN: {p.hn}</p>
                    
                    {allergenInfo && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-red-950/60 text-red-400 rounded border border-red-900/30">
                          {allergenInfo.allergen}
                        </span>
                        {allergenInfo.geneticBiomarker && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-indigo-950/60 text-indigo-400 rounded border border-indigo-900/30 truncate max-w-[120px]">
                            {allergenInfo.geneticBiomarker.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredPatients.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-xs text-zinc-500">No patients matched search criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: High-Fidelity Clinical Editor Form */}
        <form onSubmit={handleSaveDraft} className="flex-1 flex flex-col min-w-0 bg-[#08090b] overflow-y-auto">
          
          <div className="p-6 space-y-6">
            
            {/* 2.1 Demographics section */}
            <div className="p-5 bg-[#0f1013] border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <User className="w-4 h-4 text-zinc-500" />
                <span>Patient Demographics</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Full Name / ชือ-นามสกุล</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Hospital Number (HN)</label>
                  <input 
                    type="text" 
                    value={hn} 
                    onChange={e => setHn(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="HN-YYYY-XXXX"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">National ID / Passport</label>
                  <input 
                    type="text" 
                    value={nationalId} 
                    onChange={e => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="X-XXXX-XXXXX-XX-X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Birth Date</label>
                  <input 
                    type="date" 
                    value={birthDate} 
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Gender</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Blood Group</label>
                  <input 
                    type="text" 
                    value={bloodGroup} 
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono"
                    placeholder="e.g. O+"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono"
                    placeholder="+66..."
                  />
                </div>
              </div>

            </div>

            {/* 2.2 Clinical Allergy Data section */}
            <div className="p-5 bg-[#0f1013] border border-zinc-800 rounded-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-zinc-500" />
                  <span>Allergy Severity & Genotyping Details</span>
                </div>
              </div>

              {/* Drug Allergen & Genetic Biomarkers row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Drug Allergen / ยาทีแพ้</label>
                  <input 
                    type="text" 
                    value={allergen} 
                    onChange={e => setAllergen(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-bold tracking-wide focus:outline-none focus:border-indigo-500"
                    placeholder="Enter generic name (e.g., Carbamazepine)"
                  />
                  {/* Presets help */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {PRESETS.allergens.slice(0, 4).map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAllergenPresetSelect(preset)}
                        className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 hover:text-zinc-200 font-mono"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Pharmacogenomic Marker / ผลแล็บพันธุศาสตร์</label>
                  <input 
                    type="text" 
                    value={geneticBiomarker} 
                    onChange={e => setGeneticBiomarker(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-indigo-950 rounded-xl text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 bg-indigo-950/20"
                    placeholder="e.g. HLA-B*15:02 Positive"
                  />
                  {/* Presets help */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {PRESETS.geneticBiomarkers.slice(0, 3).map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleBiomarkerPresetSelect(preset)}
                        className="px-1.5 py-0.5 rounded bg-indigo-950/20 border border-indigo-900/30 text-[9px] text-indigo-300 hover:text-indigo-200 font-mono"
                      >
                        {preset.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Severity Rating</label>
                  <select 
                    value={severity} 
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="Mild">Mild / อาการเล็กน้อย</option>
                    <option value="Moderate">Moderate / อาการปานกลาง</option>
                    <option value="Severe">Severe / อาการรุนแรง</option>
                    <option value="Life-threatening">Life-threatening / ร้ายแรงถึงแก่ชีวิต</option>
                  </select>
                </div>
              </div>

              {/* Clinical Decision Support Advisory Alert Card */}
              {cdsSuggestion && (
                <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-orange-400">
                    <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Clinical Decision Support Alert</span>
                  </div>
                  <p className="text-xs text-orange-200/95 leading-normal">
                    {cdsSuggestion.warning}
                  </p>
                  <button
                    type="button"
                    onClick={handleApplyCds}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 text-[10px] font-extrabold uppercase rounded-lg shadow-md transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-populate clinical risk definitions</span>
                  </button>
                </div>
              )}

              {/* Reaction Type & Onset Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Reaction Type / กลไกการเกิดอาการแพ้</label>
                  <input 
                    type="text" 
                    value={reactionType} 
                    onChange={e => setReactionType(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none"
                    placeholder="e.g. Type IV Delayed Hypersensitivity"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Date of Onset / วันทีเกิดอาการครั้งแรก</label>
                  <input 
                    type="date" 
                    value={dateOfOnset} 
                    onChange={e => setDateOfOnset(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Manifestations / Symptoms Input */}
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Manifestations / อาการทีเกิด (comma-separated)</label>
                <textarea 
                  value={manifestationsText} 
                  onChange={e => setManifestationsText(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 h-16 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="SJS, TEN, Blistering, Mucosal sloughing..."
                />
                
                {/* Presets helpers */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[9px] text-zinc-600 font-bold mr-1 self-center uppercase">Add presets:</span>
                  {PRESETS.manifestations.slice(0, 5).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleAddManifestationPreset(m)}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-[9px] text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      + {m.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 2.3 Cross Reactivity and Alternatives section */}
            <div className="p-5 bg-[#0f1013] border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex items-center space-x-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4 text-zinc-500" />
                <span>Cross-Reactivity & Therapeutic Safety Guidelines</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-red-400 font-extrabold block mb-1 uppercase tracking-wider">Cross-Reactive Drugs to Avoid (comma-separated)</label>
                  <textarea 
                    value={crossReactiveText} 
                    onChange={e => setCrossReactiveText(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-red-900/30 rounded-xl text-xs text-red-200 h-20 focus:outline-none focus:border-red-800/60 font-mono"
                    placeholder="Oxcarbazepine, Phenytoin, Phenobarbital..."
                  />
                  <p className="text-[9px] text-zinc-500 leading-snug mt-1.5">
                    Drugs sharing high chemical or structural similarity. Exposure can trigger identical SCAR reactions.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-emerald-400 font-extrabold block mb-1 uppercase tracking-wider font-bold">Recommended Alternatives (comma-separated)</label>
                  <textarea 
                    value={alternativeText} 
                    onChange={e => setAlternativeText(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-emerald-900/30 rounded-xl text-xs text-emerald-200 h-20 focus:outline-none focus:border-emerald-800/60 font-mono"
                    placeholder="Valproic Acid, Gabapentin, Levetiracetam..."
                  />
                  <p className="text-[9px] text-zinc-500 leading-snug mt-1.5">
                    Clinically safe therapeutic options in non-aromatic anticonvulsant groups.
                  </p>
                </div>
              </div>

              {/* Pharmacist clinical notes */}
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Clinical Pharmacist Summary Advisory Notes</label>
                <textarea 
                  value={clinicalNotes} 
                  onChange={e => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 h-20 focus:outline-none font-mono"
                  placeholder="Detail symptoms, genetic confirmation clinical guidelines..."
                />
              </div>

            </div>

          </div>

          {/* 3. Bottom Sticky Action Bar inside the editor */}
          <div className="sticky bottom-0 bg-[#0c0d10] border-t border-zinc-800 px-6 py-4 flex justify-between items-center mt-auto">
            <div className="flex items-center space-x-1 text-xs text-zinc-500">
              <Eye className="w-3.5 h-3.5" />
              <span>Status: </span>
              <span className={`font-bold uppercase ${selectedPatient.status === 'Approved' ? 'text-emerald-400' : 'text-amber-500'}`}>
                {selectedPatient.status}
              </span>
            </div>

            <div className="flex space-x-3">
              <button 
                type="button" 
                onClick={() => handleSaveDraft()}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-bold rounded-xl transition-all"
              >
                Save as Draft
              </button>

              <button 
                type="button"
                onClick={() => {
                  handleSaveDraft();
                  setIsSignatureModalOpen(true);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-2"
              >
                <Award className="w-4 h-4" />
                <span>Approve & Sign eMAC</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* 3. DIGITAL SIGNATURE AUTHORIZATION DIALOG */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="p-6 bg-zinc-900 border-b border-zinc-800/80">
              <div className="flex items-center space-x-2.5 text-emerald-400">
                <Award className="w-6 h-6 text-emerald-500" />
                <h3 className="text-base font-extrabold text-zinc-100 uppercase tracking-wide">Signature Authorization</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">Provide credential details to sign the electronic allergy record.</p>
            </div>

            {/* Inputs */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Clinical Pharmacist Name / เภสัชกรผู้ประเมิน</label>
                <input 
                  type="text" 
                  value={pharmacistName}
                  onChange={e => setPharmacistName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">License No. / เลขใบอนุญาตประกอบวิชาชีพ</label>
                  <input 
                    type="text" 
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">Approved Facility / โรงพยาบาล</label>
                  <input 
                    type="text" 
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/15 rounded-xl flex items-start space-x-2.5 text-[10px] text-zinc-400 leading-normal">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-200 block mb-0.5">Crypto-Signed Handshake Assertion</span>
                  By approving, this signed assertion will immediately update the patient's secure eMAC wallet over FHIR servers and generate a verifiable, scanned cryptographic barcode.
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex justify-end space-x-3">
              <button 
                type="button"
                onClick={() => setIsSignatureModalOpen(false)}
                className="px-4 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-xl hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSignAndApprove}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all"
              >
                Authorize & Sign
              </button>
            </div>

            {/* Close button icon */}
            <button 
              onClick={() => setIsSignatureModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300"
            >
              <Trash className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
