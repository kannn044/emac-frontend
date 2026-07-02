/**
 * PatientDetail (P4) — verification workspace
 *   pending  → ฟอร์มเลือกยา + กรอกคลินิก + Save note / Reject / Approve&Sign (ลงนามจริงที่ server)
 *   verified/rejected → read-only
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  User, Activity, Pill, ShieldCheck, AlertOctagon, Award,
  CheckCircle, X, FileText, Dna, Loader2,
} from 'lucide-react';
import {
  api, ApiError,
  type PatientDetail as Detail, type PatientStatus, type Severity, type VerifyInput,
  type CardLinks, type AssessmentCode,
} from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';
import { CardView } from './CardView';

const STATUS_LABEL: Record<PatientStatus, { text: string; cls: string }> = {
  pending: { text: 'รอตรวจสอบ', cls: 'text-[var(--warn-text)] bg-[var(--warn-bg)] border-[var(--warn-border)]' },
  verified: { text: 'ยืนยัน & ลงนามแล้ว', cls: 'text-[var(--primary)] bg-[var(--tint)] border-[var(--line)]' },
  rejected: { text: 'ปฏิเสธ', cls: 'text-[var(--danger-text)] bg-[var(--danger-bg)] border-[var(--danger-border)]' },
};

const SEVERITY_OPTS: { value: Severity; label: string }[] = [
  { value: 'mild', label: 'Mild / เล็กน้อย' },
  { value: 'moderate', label: 'Moderate / ปานกลาง' },
  { value: 'severe', label: 'Severe / รุนแรง' },
  { value: 'life-threatening', label: 'Life-threatening / ถึงชีวิต' },
];

const splitList = (s: string): string[] =>
  s.split(',').map((x) => x.trim()).filter(Boolean);

const ASSESSMENT_OPTS: { value: AssessmentCode; label: string }[] = [
  { value: '1', label: '1 · ใช่แน่นอน' },
  { value: '2', label: '2 · น่าจะใช่' },
  { value: '3', label: '3 · อาจจะใช่' },
  { value: 'H', label: 'H · ประวัติการแพ้ยา' },
];

const sexLabel = (s: string | null): string =>
  s === 'male' ? 'ชาย' : s === 'female' ? 'หญิง' : s ? 'อื่นๆ' : '-';

interface DrugMeta { adverseReaction: string; assessment: AssessmentCode }

interface Props {
  detail: Detail | null;
  loading: boolean;
  error: string | null;
  onChanged: () => void;
}

export const PatientDetail: React.FC<Props> = ({ detail, loading, error, onChanged }) => {
  const { identity } = useAuth();

  // form state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [biomarker, setBiomarker] = useState('');
  const [severity, setSeverity] = useState<Severity>('severe');
  const [manifestations, setManifestations] = useState('');
  const [crossReactive, setCrossReactive] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSign, setShowSign] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [cardLinks, setCardLinks] = useState<CardLinks | null>(null);
  const [drugMeta, setDrugMeta] = useState<Record<string, DrugMeta>>({});

  // reset ฟอร์มเมื่อเปลี่ยนผู้ป่วย
  useEffect(() => {
    if (!detail) return;
    setSelected(new Set(detail.suspectDrugs.filter((d) => d.group).map((d) => d.didstd)));
    const meta: Record<string, DrugMeta> = {};
    detail.suspectDrugs.forEach((d) => { meta[d.didstd] = { adverseReaction: '', assessment: '1' }; });
    setDrugMeta(meta);
    setBiomarker('');
    setSeverity('severe');
    setManifestations('');
    setCrossReactive(detail.otherGroups.concat(detail.nsaidGroups, detail.antibioticGroups).join(', '));
    setAlternatives('');
    setNote(detail.note ?? '');
    setFormError(null);
    setShowSign(false);
    setShowReject(false);
    setRejectReason('');
    setCardLinks(null);
  }, [detail?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ดึงบัตรเมื่อ record ถูก verify แล้ว (เพื่อโชว์ QR + ลิงก์ตรวจ)
  useEffect(() => {
    if (!detail || detail.status !== 'verified') {
      setCardLinks(null);
      return;
    }
    let active = true;
    api
      .getPatientCard(detail.id)
      .then((r) => { if (active) setCardLinks(r.links); })
      .catch(() => { if (active) setCardLinks(null); });
    return () => { active = false; };
  }, [detail?.id, detail?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildInput = (): VerifyInput | null => {
    if (!detail) return null;
    const confirmedDrugs = detail.suspectDrugs
      .filter((d) => selected.has(d.didstd))
      .map((d) => ({
        didstd: d.didstd,
        dname: d.dname,
        group: d.group,
        adverseReaction: drugMeta[d.didstd]?.adverseReaction?.trim() || undefined,
        assessment: drugMeta[d.didstd]?.assessment ?? '1',
      }));
    if (confirmedDrugs.length === 0) {
      setFormError('เลือกยาที่ยืนยันอย่างน้อย 1 รายการ');
      return null;
    }
    return {
      confirmedDrugs,
      biomarker: biomarker.trim() || undefined,
      severity,
      manifestations: splitList(manifestations),
      crossReactiveDrugs: splitList(crossReactive),
      alternativeDrugs: splitList(alternatives),
      note: note.trim() || undefined,
    };
  };

  const handleSaveNote = async () => {
    if (!detail) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await api.updateNote(detail.id, note.trim());
      onChanged();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    const input = buildInput();
    if (!input || !detail) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await api.verifyPatient(detail.id, input);
      setShowSign(false);
      onChanged();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'ยืนยันไม่สำเร็จ');
      setShowSign(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!detail || !rejectReason.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await api.rejectPatient(detail.id, rejectReason.trim());
      setShowReject(false);
      onChanged();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'ปฏิเสธไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = (didstd: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(didstd)) next.delete(didstd);
      else next.add(didstd);
      return next;
    });

  const selectedCount = useMemo(() => selected.size, [selected]);

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--surface)]">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  if (error)
    return <div className="flex-1 flex items-center justify-center bg-[var(--surface)] p-8"><p className="text-sm text-[var(--danger-text)]">{error}</p></div>;
  if (!detail)
    return <div className="flex-1 flex items-center justify-center bg-[var(--surface)] p-8"><p className="text-sm text-[var(--muted)]">เลือกผู้ป่วยจากคิวด้านซ้ายเพื่อตรวจสอบ</p></div>;

  const st = STATUS_LABEL[detail.status];
  const editable = detail.status === 'pending';

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--surface)] overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--ink)]">{detail.fullName ?? detail.hn ?? '(ไม่มีชื่อ)'}</h2>
            <p className="text-xs text-[var(--muted)] font-mono mt-0.5">
              {detail.hn ?? '-'} · รพ. {detail.sourceHospcode} · admit {detail.datetimeAdmit} · {detail.diagcode}
            </p>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${st.cls}`}>{st.text}</span>
        </div>

        {/* Demographics */}
        <Section icon={<User className="w-4 h-4 text-[var(--primary)]" />} title="ข้อมูลผู้ป่วย">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="ชื่อ-สกุล" value={detail.fullName ?? '-'} />
            <Field label="เพศ" value={sexLabel(detail.sex)} />
            <Field label="วันเกิด" value={detail.birthDate ?? '-'} />
            <Field label="HN" value={detail.hn ?? '-'} />
            <Field label="PID" value={detail.pid} />
            <Field label="CID" value={detail.cid ?? '-'} />
            <Field label="Diagnosis" value={detail.diagcode} />
          </div>
          <Field label="ที่อยู่" value={detail.address ?? '-'} />
        </Section>

        {/* Confirmed drugs (select subset) */}
        <Section
          icon={<Pill className="w-4 h-4 text-[var(--primary)]" />}
          title={`ยาที่ต้องสงสัย — เลือกที่ยืนยันว่าแพ้ (${selectedCount}/${detail.suspectDrugs.length})`}
        >
          <div className="space-y-2">
            {detail.suspectDrugs.map((d, i) => {
              const on = selected.has(d.didstd);
              const meta = drugMeta[d.didstd] ?? { adverseReaction: '', assessment: '1' as AssessmentCode };
              return (
                <div
                  key={`${d.didstd}-${i}`}
                  className={`rounded-xl border transition-all ${
                    on ? 'bg-[var(--tint)] border-[var(--primary-soft)]' : 'bg-[var(--surface)] border-[var(--border)]'
                  }`}
                >
                  <button
                    type="button"
                    disabled={!editable}
                    onClick={() => toggle(d.didstd)}
                    className={`w-full flex items-center justify-between gap-3 p-3 text-left ${editable ? '' : 'opacity-80 cursor-default'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--faint)] bg-[var(--surface)]'}`}>
                        {on && <CheckCircle className="w-3 h-3 text-white" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--ink)] truncate">{d.dname}</p>
                        <p className="text-[10px] text-[var(--muted)] font-mono">TMT {d.didstd} · {d.dateServ}</p>
                      </div>
                    </div>
                    {d.group && (
                      <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono font-bold bg-[var(--danger-bg)] text-[var(--danger-text)] rounded border border-[var(--danger-border)]">
                        {d.group}
                      </span>
                    )}
                  </button>

                  {/* per-drug: อาการไม่พึงประสงค์ + ผลการประเมิน (แสดงเมื่อเลือก) */}
                  {on && (
                    <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-[var(--line)]">
                      <div className="sm:col-span-2">
                        <label className="text-[9px] text-[var(--muted)] font-bold uppercase">อาการไม่พึงประสงค์</label>
                        <input
                          value={meta.adverseReaction}
                          disabled={!editable}
                          onChange={(e) =>
                            setDrugMeta((m) => ({ ...m, [d.didstd]: { ...meta, adverseReaction: e.target.value } }))
                          }
                          placeholder="เช่น ผื่นแดง, SJS, หายใจลำบาก"
                          className="w-full mt-0.5 px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-[var(--muted)] font-bold uppercase">ผลการประเมิน</label>
                        <select
                          value={meta.assessment}
                          disabled={!editable}
                          onChange={(e) =>
                            setDrugMeta((m) => ({ ...m, [d.didstd]: { ...meta, assessment: e.target.value as AssessmentCode } }))
                          }
                          className="w-full mt-0.5 px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--ink)] focus:outline-none disabled:opacity-60"
                        >
                          {ASSESSMENT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Clinical fields */}
        <Section icon={<Dna className="w-4 h-4 text-[var(--primary)]" />} title="รายละเอียดคลินิก (เภสัชกรกรอก)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Pharmacogenomic Biomarker" value={biomarker} onChange={setBiomarker} disabled={!editable} placeholder="เช่น HLA-B*15:02 Positive" />
            <div>
              <Label>ความรุนแรง</Label>
              <select
                value={severity}
                disabled={!editable}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--ink)] focus:outline-none disabled:opacity-60"
              >
                {SEVERITY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <TextArea label="อาการที่เกิด (คั่นด้วย ,)" value={manifestations} onChange={setManifestations} disabled={!editable} placeholder="SJS, TEN, ผื่น..." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextArea label="ยาห้ามใช้ (cross-reactive)" value={crossReactive} onChange={setCrossReactive} disabled={!editable} placeholder="Oxcarbazepine, Phenytoin" tone="red" />
            <TextArea label="ยาทางเลือก" value={alternatives} onChange={setAlternatives} disabled={!editable} placeholder="Levetiracetam, Gabapentin" tone="emerald" />
          </div>
          <TextArea label="หมายเหตุเภสัชกร" value={note} onChange={setNote} disabled={!editable} placeholder="บันทึกเพิ่มเติม..." />
        </Section>

        {cardLinks && <CardView links={cardLinks} />}

        {formError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger-text)] text-xs">
            <AlertOctagon className="w-4 h-4 shrink-0" /> {formError}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 bg-[var(--surface-2)] border-t border-[var(--border-soft)] px-6 py-4 flex items-center justify-between mt-auto gap-3">
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] min-w-0">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {editable ? 'เลือกยา + กรอกคลินิก แล้วลงนามออกบัตร' : 'record ถูกดำเนินการแล้ว (read-only)'}
          </span>
        </span>
        {editable && (
          <div className="flex gap-2 shrink-0">
            <button onClick={handleSaveNote} disabled={submitting}
              className="px-3 py-2 bg-[var(--surface)] hover:bg-[var(--tint)] text-[var(--ink)] border border-[var(--border)] text-xs font-bold rounded-xl disabled:opacity-50">
              บันทึก note
            </button>
            <button onClick={() => setShowReject(true)} disabled={submitting}
              className="px-3 py-2 bg-[var(--danger-bg)] hover:bg-[var(--danger-bg-hover)] text-[var(--danger-text)] border border-[var(--danger-border)] text-xs font-bold rounded-xl disabled:opacity-50">
              ปฏิเสธ
            </button>
            <button onClick={() => { if (buildInput()) setShowSign(true); }} disabled={submitting}
              className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold rounded-xl flex items-center gap-2 disabled:opacity-50">
              <Award className="w-4 h-4" /> ตรวจสอบ & ลงนาม
            </button>
          </div>
        )}
      </div>

      {/* Signature modal */}
      {showSign && (
        <Modal onClose={() => setShowSign(false)}>
          <div className="flex items-center gap-2.5 text-[var(--primary)] mb-1">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-base font-extrabold text-[var(--ink)]">ยืนยันการลงนามดิจิทัล</h3>
          </div>
          <p className="text-xs text-[var(--muted)] mb-4">
            ระบบจะสร้างลายเซ็นดิจิทัล (Ed25519) ด้วย key ของคุณที่ฝั่ง server แล้วออกบัตรแพ้ยา
          </p>
          <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs space-y-1 mb-4">
            <Row k="ผู้ลงนาม" v={identity?.name ?? '-'} />
            <Row k="บทบาท / รพ." v={`${identity?.role} · ${identity?.hospcode}`} />
            <Row k="ยาที่ยืนยัน" v={`${selectedCount} รายการ`} />
            <Row k="ความรุนแรง" v={severity} />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowSign(false)} className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] text-xs font-bold rounded-xl hover:bg-[var(--bg)]">ยกเลิก</button>
            <button onClick={handleVerify} disabled={submitting}
              className="px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold rounded-xl flex items-center gap-2 disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} ลงนาม
            </button>
          </div>
        </Modal>
      )}

      {/* Reject modal */}
      {showReject && (
        <Modal onClose={() => setShowReject(false)}>
          <div className="flex items-center gap-2.5 text-[var(--danger-text)] mb-3">
            <AlertOctagon className="w-6 h-6" />
            <h3 className="text-base font-extrabold text-[var(--ink)]">ปฏิเสธ record นี้</h3>
          </div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="เหตุผลการปฏิเสธ..."
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--ink)] h-24 focus:outline-none focus:border-[var(--danger-border)]"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowReject(false)} className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] text-xs font-bold rounded-xl hover:bg-[var(--bg)]">ยกเลิก</button>
            <button onClick={handleReject} disabled={submitting || !rejectReason.trim()}
              className="px-5 py-2 bg-[var(--danger-btn)] hover:bg-[var(--danger-btn-hover)] text-white text-xs font-extrabold rounded-xl disabled:opacity-50">
              ยืนยันปฏิเสธ
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ---- small presentational helpers ----
const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl space-y-4 shadow-sm">
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[var(--label)] text-xs font-bold uppercase tracking-wider">{icon}<span>{title}</span></div>
      {/* เส้นคู่แบบหนังสือราชการ */}
      <div>
        <div className="h-px bg-[var(--rule)]" />
        <div className="h-px bg-[var(--line)] mt-[2px]" />
      </div>
    </div>
    {children}
  </div>
);
const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider mb-1">{label}</p><p className="text-sm text-[var(--ink)] font-mono">{value}</p></div>
);
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-[10px] text-[var(--muted)] font-bold block mb-1">{children}</label>
);
const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string }> = ({ label, value, onChange, disabled, placeholder }) => (
  <div>
    <Label>{label}</Label>
    <input value={value} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] disabled:opacity-60" />
  </div>
);
const TextArea: React.FC<{ label: string; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string; tone?: 'red' | 'emerald' }> = ({ label, value, onChange, disabled, placeholder, tone }) => {
  const border = tone === 'red' ? 'border-[var(--danger-border)] text-[var(--danger-text)] bg-[var(--danger-faint)]' : tone === 'emerald' ? 'border-[var(--line)] text-[var(--primary)] bg-[var(--tint-faint)]' : 'border-[var(--border)] text-[var(--ink)] bg-[var(--surface)]';
  return (
    <div>
      <Label>{label}</Label>
      <textarea value={value} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-xl text-xs h-16 focus:outline-none focus:border-[var(--primary)] font-mono disabled:opacity-60 ${border}`} />
    </div>
  );
};
const Row: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="flex justify-between gap-4"><span className="text-[var(--muted)]">{k}</span><span className="text-[var(--ink)] font-bold text-right">{v}</span></div>
);
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-[var(--muted-2)] hover:text-[var(--ink)]"><X className="w-4 h-4" /></button>
      {children}
    </div>
  </div>
);
