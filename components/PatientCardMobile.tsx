/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  CheckCircle, 
  QrCode, 
  User, 
  Calendar, 
  Info, 
  Dna, 
  AlertTriangle, 
  Smartphone, 
  X,
  CreditCard,
  ChevronRight,
  RefreshCw,
  Award,
  Plus
} from 'lucide-react';
import { PatientProfile, AllergyRecord } from '../types';

interface PatientCardMobileProps {
  patient: PatientProfile;
}

export const PatientCardMobile: React.FC<PatientCardMobileProps> = ({ patient }) => {
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'qr'>('front');
  const [walletAdded, setWalletAdded] = useState(false);
  const [showWalletNotification, setShowWalletNotification] = useState(false);

  const activeAllergy = patient.allergies[0]; // Primary allergy to display

  // Render mock phone status bar
  const renderPhoneHeader = () => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <div className="flex justify-between items-center px-6 py-2.5 text-zinc-400 text-xs font-mono select-none bg-zinc-900 border-b border-zinc-800/40 shrink-0">
        <span className="font-semibold">{timeString}</span>
        {/* Notch */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-black rounded-b-xl z-20 flex justify-center items-end pb-1">
          <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-800/40 mr-1.5"></div>
          <div className="w-12 h-1 bg-zinc-800 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-1.5">
          {/* Signal */}
          <div className="flex items-end space-x-0.5 h-2.5">
            <div className="w-[2px] h-[3px] bg-zinc-400 rounded-xs"></div>
            <div className="w-[2px] h-[5px] bg-zinc-400 rounded-xs"></div>
            <div className="w-[2px] h-[7px] bg-zinc-400 rounded-xs"></div>
            <div className="w-[2px] h-[9px] bg-zinc-400 rounded-xs"></div>
          </div>
          <span className="text-[10px]">5G</span>
          {/* Battery */}
          <div className="w-5 h-2.5 border border-zinc-500 rounded-sm p-0.5 flex items-center">
            <div className="w-full h-full bg-emerald-500 rounded-2xs"></div>
          </div>
        </div>
      </div>
    );
  };

  const handleAddToWallet = () => {
    setWalletAdded(true);
    setShowWalletNotification(true);
    setTimeout(() => {
      setShowWalletNotification(false);
    }, 4000);
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-[340px] md:max-w-[360px] mx-auto select-none">
      
      {/* Phone Case Frame */}
      <div className="relative w-full aspect-[9/18.5] bg-zinc-950 rounded-[44px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[3px] border-zinc-800 flex flex-col overflow-hidden">
        
        {/* Screen Bezel and Inner Container */}
        <div className="relative flex-1 bg-zinc-900 rounded-[34px] border border-zinc-800 overflow-hidden flex flex-col">
          
          {/* 1. Phone Top Status Bar */}
          {renderPhoneHeader()}

          {/* 2. Wallet Notification Banner */}
          <AnimatePresence>
            {showWalletNotification && (
              <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute top-12 left-3 right-3 z-30 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-lg flex items-start space-x-3"
              >
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-100">Card Added</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                    eMAC pass successfully added to Apple & Google Wallet ecosystem.
                  </p>
                </div>
                <button onClick={() => setShowWalletNotification(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Mobile Header (App Specific) */}
          <div className="px-5 pt-5 pb-3 bg-zinc-900 flex justify-between items-center shrink-0">
            <div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">TH e-MAC Wallet</span>
              </div>
              <h4 className="text-sm font-extrabold text-zinc-100 tracking-tight">Active Allergy ID</h4>
            </div>
            
            {/* National Crest Simulation (Thai Red Cross / MOPH concept) */}
            <div className="w-7 h-7 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
          </div>

          {/* 4. Quick View Switcher inside the Mobile screen */}
          <div className="px-5 py-1 flex bg-zinc-900 shrink-0">
            <div className="w-full bg-zinc-950 p-1 rounded-xl flex border border-zinc-800/60">
              <button 
                onClick={() => setCardSide('front')}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${cardSide === 'front' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Front
              </button>
              <button 
                onClick={() => setCardSide('back')}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${cardSide === 'back' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Clinical
              </button>
              <button 
                onClick={() => setCardSide('qr')}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${cardSide === 'qr' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Scan QR
              </button>
            </div>
          </div>

          {/* 5. Phone View Screen Contents - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-zinc-950 space-y-3 pb-8">
            
            <AnimatePresence mode="wait">
              {cardSide === 'front' && (
                <motion.div
                  key="front-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* The eMAC Card Visual Design */}
                  <div className={`relative rounded-2xl overflow-hidden border ${patient.status === 'Approved' ? 'border-red-500/40 bg-gradient-to-br from-zinc-900 via-red-950/20 to-zinc-900' : 'border-amber-500/40 bg-gradient-to-br from-zinc-900 via-amber-950/20 to-zinc-900'} shadow-md`}>
                    
                    {/* Top warning ribbon */}
                    <div className={`px-4 py-2 flex items-center justify-between text-white font-bold tracking-wider text-[9px] ${patient.status === 'Approved' ? 'bg-red-600' : 'bg-amber-500 animate-pulse text-zinc-950'}`}>
                      <span className="uppercase flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Severe Allergy Card / บัตรแพ้ยารุนแรง
                      </span>
                      <span className="font-mono text-[8px] bg-black/30 px-1.5 py-0.5 rounded">eMAC</span>
                    </div>

                    <div className="p-4 space-y-3.5">
                      
                      {/* Patient Details Row */}
                      <div className="flex items-center space-x-3">
                        <img 
                          src={patient.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                          alt={patient.name}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-700/60 bg-zinc-800 shadow-inner shrink-0"
                        />
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Patient / ผู้ป่วย</p>
                          <h5 className="text-xs font-bold text-zinc-100 truncate mt-0.5">{patient.name}</h5>
                          <div className="flex items-center space-x-2 mt-1 text-[9px] text-zinc-400 font-mono">
                            <span>HN: {patient.hn}</span>
                            <span>•</span>
                            <span>Blood: {patient.bloodGroup}</span>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-zinc-800/80"></div>

                      {/* The Drug and Manifestation block */}
                      {activeAllergy ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">ALLERGENIC DRUG / ชื่อยาทีแพ้</span>
                            <span className="text-base font-extrabold text-red-500 tracking-tight block leading-tight mt-0.5">
                              {activeAllergy.allergen.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">SEVERITY / ความรุนแรง</span>
                              <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-950/60 text-red-400 border border-red-800/40">
                                {activeAllergy.severity}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">REACTION / อาการแพ้</span>
                              <span className="text-[10px] text-zinc-200 font-semibold block truncate mt-0.5" title={activeAllergy.manifestations.join(', ')}>
                                {activeAllergy.manifestations[0]}
                              </span>
                            </div>
                          </div>

                          {/* Genetic biomarker warning if present */}
                          {activeAllergy.geneticBiomarker && (
                            <div className="mt-2.5 p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center space-x-2">
                              <Dna className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[8px] text-indigo-300 font-bold uppercase block tracking-wider">Pharmacogenomics Marker</span>
                                <span className="text-[10px] text-indigo-200 font-bold block truncate leading-none mt-0.5">
                                  {activeAllergy.geneticBiomarker}
                                </span>
                              </div>
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="text-center py-4 text-xs text-zinc-500 font-mono">
                          No Allergy Records Found
                        </div>
                      )}

                      {/* Stamp of authenticity */}
                      <div className="border-t border-zinc-800/80 pt-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {patient.status === 'Approved' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span className={`text-[9px] font-bold ${patient.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {patient.status === 'Approved' ? 'Pharmacist Approved' : 'Draft Allergy Card'}
                          </span>
                        </div>
                        <span className="text-[8px] text-zinc-500 font-mono">ID: {patient.nationalId.slice(-4)}</span>
                      </div>

                    </div>
                  </div>

                  {/* Wallet Download and Quick Actions */}
                  <div className="space-y-2">
                    <button 
                      onClick={handleAddToWallet}
                      className="w-full h-11 bg-black hover:bg-zinc-900 border border-zinc-800 rounded-xl px-4 flex items-center justify-between transition-all group active:scale-95"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CreditCard className="w-4 h-4 text-zinc-300" />
                        <span className="text-xs font-bold text-zinc-100">Add to Apple Wallet</span>
                      </div>
                      <Plus className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                    </button>

                    <div className="p-3 bg-zinc-900/60 border border-zinc-800/50 rounded-xl space-y-1.5 text-center">
                      <p className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Emergency Access Protocol</p>
                      <p className="text-[10px] text-zinc-300 leading-normal">
                        Show this digital card to any physician, dentist, or pharmacist before receiving medication prescriptions.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {cardSide === 'back' && (
                <motion.div
                  key="back-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {/* Severe Cross-Reactivity Checklist */}
                  <div className="p-4 bg-zinc-900/90 border border-red-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-1.5 text-red-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <h6 className="text-[10px] font-extrabold uppercase tracking-wider">Strictly Avoid / ยาทีต้องหลีกเลียง</h6>
                    </div>
                    
                    {activeAllergy && activeAllergy.crossReactiveDrugs.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[9px] text-zinc-400 leading-relaxed">
                          The following aromatic drugs are contraindicated due to high cross-reactivity risk:
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {activeAllergy.crossReactiveDrugs.map((drug) => (
                            <span key={drug} className="px-2 py-1 rounded bg-red-950/40 border border-red-900/40 text-[9px] font-bold text-red-300 truncate">
                              • {drug}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 font-mono">No specific cross-reactivities listed.</p>
                    )}
                  </div>

                  {/* Safe Alternatives */}
                  <div className="p-4 bg-zinc-900/90 border border-emerald-500/30 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-1.5 text-emerald-400">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <h6 className="text-[10px] font-extrabold uppercase tracking-wider">Suggested Alternatives / ยาทีใช้แทนได้</h6>
                    </div>

                    {activeAllergy && activeAllergy.alternativeDrugs.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[9px] text-zinc-400 leading-relaxed">
                          These non-aromatic medications are clinically recommended options:
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {activeAllergy.alternativeDrugs.map((drug) => (
                            <span key={drug} className="px-2 py-1 rounded bg-emerald-950/40 border border-emerald-900/40 text-[9px] font-bold text-emerald-300 truncate">
                              ✓ {drug}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 font-mono">No alternative therapies specified.</p>
                    )}
                  </div>

                  {/* Clinician's Notes */}
                  {activeAllergy?.clinicalNotes && (
                    <div className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1.5">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Pharmacist Clinical Notes</span>
                      <p className="text-[10px] text-zinc-300 leading-normal font-mono text-[9px]">
                        {activeAllergy.clinicalNotes}
                      </p>
                    </div>
                  )}

                  {/* Official Verification Stamp */}
                  {patient.status === 'Approved' ? (
                    <div className="p-3 bg-gradient-to-r from-emerald-950/20 to-zinc-900 border border-emerald-500/20 rounded-xl flex items-center space-x-3">
                      <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="min-w-0 flex-1 leading-snug">
                        <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Approved Electronic Signature</p>
                        <p className="text-[10px] text-zinc-100 font-bold truncate">{patient.approvedBy}</p>
                        <p className="text-[9px] text-zinc-400 truncate">{patient.approvedHospital} ({patient.approvedLicense})</p>
                        <p className="text-[8px] text-zinc-500 font-mono mt-0.5">Verified: {patient.approvalDate}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-900/60 border border-dashed border-zinc-800 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Pending Pharmacist Verification</span>
                      <p className="text-[9px] text-zinc-500 mt-1 leading-normal">
                        This card has not been officially signed off by a clinical pharmacist. Do not use for automated decision systems.
                      </p>
                    </div>
                  )}

                </motion.div>
              )}

              {cardSide === 'qr' && (
                <motion.div
                  key="qr-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-center"
                >
                  <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-md inline-block">
                    {/* Simulated high-fidelity medical QR code with patient data */}
                    <div className="relative w-44 h-44 bg-zinc-100 rounded-lg flex items-center justify-center border border-zinc-200">
                      <QrCode className="w-40 h-40 text-zinc-950" />
                      
                      {/* Red cross center logo */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-md flex items-center justify-center shadow-md">
                        <ShieldAlert className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                      *EMAC-{patient.id.toUpperCase()}-{activeAllergy?.allergen.slice(0, 3).toUpperCase()}*
                    </div>
                  </div>

                  <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1 text-center">
                    <p className="text-[10px] font-extrabold text-zinc-200 uppercase tracking-wider">Hospital Interoperability</p>
                    <p className="text-[9px] text-zinc-400 leading-normal">
                      Scan to fetch HL7 FHIR AllergyIntolerance resources and auto-inject allergy lists directly into EMR systems (e.g., Epic, Cerner, Hos-XP).
                    </p>
                  </div>

                  {/* Wallet integration mockup */}
                  <div className="flex space-x-2 justify-center">
                    <div className="w-1/2 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-[10px] font-bold text-zinc-300">
                      Apple Passbook
                    </div>
                    <div className="w-1/2 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-[10px] font-bold text-zinc-300">
                      Google Wallet
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* 6. Phone Bottom Navigation Bar Mockup */}
          <div className="h-14 bg-zinc-900 border-t border-zinc-800/40 px-6 flex justify-around items-center shrink-0">
            <div className="flex flex-col items-center space-y-0.5 text-emerald-500">
              <CreditCard className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold">My Card</span>
            </div>
            <div className="flex flex-col items-center space-y-0.5 text-zinc-500 hover:text-zinc-300 cursor-not-allowed">
              <Info className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold">Advisory</span>
            </div>
            <div className="flex flex-col items-center space-y-0.5 text-zinc-500 hover:text-zinc-300 cursor-not-allowed">
              <Smartphone className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold">Hospitals</span>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="bg-zinc-900 pb-1.5 flex justify-center shrink-0">
            <div className="w-32 h-1 bg-zinc-700/60 rounded-full"></div>
          </div>

        </div>
      </div>
    </div>
  );
};
