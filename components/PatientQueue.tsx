/**
 * PatientQueue (P3) — คิวผู้ป่วยฝั่งซ้าย: ค้นหา + กรองสถานะ + paging (ดึงจาก API)
 */
import React from 'react';
import { Search, Clock, Check, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { PatientListItem, PatientListQuery, PatientStatus } from '../lib/apiClient';

const STATUS_TABS: { label: string; value?: PatientStatus }[] = [
  { label: 'ทั้งหมด', value: undefined },
  { label: 'รอตรวจ', value: 'pending' },
  { label: 'ยืนยันแล้ว', value: 'verified' },
  { label: 'ปฏิเสธ', value: 'rejected' },
];

function StatusDot({ status }: { status: PatientStatus }) {
  if (status === 'verified')
    return (
      <span className="shrink-0 p-0.5 text-[#0F7B4D] bg-[#EEF6F0] rounded-full border border-[#CDE5D6]" title="ยืนยันแล้ว">
        <Check className="w-2.5 h-2.5" />
      </span>
    );
  if (status === 'rejected')
    return (
      <span className="shrink-0 p-0.5 text-[#B42318] bg-[#FDECEA] rounded-full border border-[#F5C6C0]" title="ปฏิเสธ">
        <X className="w-2.5 h-2.5" />
      </span>
    );
  return (
    <span className="shrink-0 p-0.5 text-[#92600A] bg-[#FDF4E3] rounded-full border border-[#F0DDB9] animate-pulse" title="รอตรวจ">
      <Clock className="w-2.5 h-2.5" />
    </span>
  );
}

interface Props {
  items: PatientListItem[];
  total: number;
  loading: boolean;
  error: string | null;
  query: PatientListQuery;
  onQueryChange: (patch: Partial<PatientListQuery>) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const PatientQueue: React.FC<Props> = ({
  items,
  total,
  loading,
  error,
  query,
  onQueryChange,
  selectedId,
  onSelect,
}) => {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="w-full md:w-80 border-r border-[#E6F0E9] flex flex-col bg-[#F9FCFA] shrink-0">
      {/* Search */}
      <div className="p-4 border-b border-[#E6F0E9]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8AA093]" />
          <input
            type="text"
            placeholder="ค้นหา HN หรือ PID..."
            value={query.q ?? ''}
            onChange={(e) => onQueryChange({ q: e.target.value || undefined, page: 1 })}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#DBE9E0] rounded-xl text-xs text-[#17281F] placeholder-[#8AA093] focus:outline-none focus:border-[#0F7B4D] font-mono"
          />
        </div>
        {/* Status tabs */}
        <div className="flex gap-1 mt-3">
          {STATUS_TABS.map((t) => {
            const active = query.status === t.value;
            return (
              <button
                key={t.label}
                onClick={() => onQueryChange({ status: t.value, page: 1 })}
                className={`flex-1 px-1.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                  active
                    ? 'bg-[#0F7B4D] text-white border-[#0F7B4D]'
                    : 'text-[#61756A] border-[#DBE9E0] bg-white hover:text-[#0F7B4D] hover:border-[#0F7B4D]/40'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2.5 bg-[#EEF6F0] border-b border-[#E6F0E9] flex justify-between items-center shrink-0">
        <span className="text-[10px] font-bold text-[#4C6456] uppercase tracking-widest font-mono">
          คิว ({total})
        </span>
        {loading && (
          <span className="w-3 h-3 border-2 border-[#0F7B4D] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E6F0E9] min-h-0">
        {error && (
          <div className="flex items-start gap-2 m-3 p-3 rounded-xl bg-[#FDECEA] border border-[#F5C6C0] text-[#B42318] text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!error && !loading && items.length === 0 && (
          <div className="p-8 text-center text-xs text-[#61756A]">ไม่พบผู้ป่วยตามเงื่อนไข</div>
        )}

        {items.map((p) => {
          const isSel = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full text-left p-4 flex items-start gap-3 transition-all outline-none ${
                isSel ? 'bg-[#EEF6F0] border-l-2 border-[#0F7B4D]' : 'bg-white hover:bg-[#F6FAF7]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <p className="text-xs font-bold text-[#17281F] truncate">
                    {p.fullName ?? p.hn ?? '(ไม่มีชื่อ)'}
                  </p>
                  <StatusDot status={p.status} />
                </div>
                <p className="text-[10px] text-[#61756A] font-mono mt-1">
                  {p.hn ?? '-'} · {p.diagcode} · admit {p.datetimeAdmit}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.groups.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#FDECEA] text-[#B42318] rounded border border-[#F5C6C0]"
                    >
                      {g}
                    </span>
                  ))}
                  {p.groups.length === 0 && (
                    <span className="text-[9px] text-[#8AA093] font-mono">
                      {p.drugCount} รายการยา
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Paging */}
      <div className="px-4 py-2.5 border-t border-[#E6F0E9] flex items-center justify-between shrink-0">
        <span className="text-[10px] text-[#61756A] font-mono">
          {from}-{to} / {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1 || loading}
            onClick={() => onQueryChange({ page: page - 1 })}
            className="p-1.5 rounded-lg border border-[#DBE9E0] bg-white text-[#61756A] hover:text-[#0F7B4D] hover:border-[#0F7B4D]/40 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-[#61756A] font-mono px-1">
            {page}/{maxPage}
          </span>
          <button
            disabled={page >= maxPage || loading}
            onClick={() => onQueryChange({ page: page + 1 })}
            className="p-1.5 rounded-lg border border-[#DBE9E0] bg-white text-[#61756A] hover:text-[#0F7B4D] hover:border-[#0F7B4D]/40 disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
