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
      <span className="shrink-0 p-0.5 text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20" title="ยืนยันแล้ว">
        <Check className="w-2.5 h-2.5" />
      </span>
    );
  if (status === 'rejected')
    return (
      <span className="shrink-0 p-0.5 text-red-400 bg-red-500/10 rounded-full border border-red-500/20" title="ปฏิเสธ">
        <X className="w-2.5 h-2.5" />
      </span>
    );
  return (
    <span className="shrink-0 p-0.5 text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20 animate-pulse" title="รอตรวจ">
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
    <div className="w-full md:w-80 border-r border-zinc-800/80 flex flex-col bg-[#0c0d10] shrink-0">
      {/* Search */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="ค้นหา HN หรือ PID..."
            value={query.q ?? ''}
            onChange={(e) => onQueryChange({ q: e.target.value || undefined, page: 1 })}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 font-mono"
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
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2.5 bg-[#101114] border-b border-zinc-800/30 flex justify-between items-center shrink-0">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
          คิว ({total})
        </span>
        {loading && (
          <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40 min-h-0">
        {error && (
          <div className="flex items-start gap-2 m-3 p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!error && !loading && items.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-500">ไม่พบผู้ป่วยตามเงื่อนไข</div>
        )}

        {items.map((p) => {
          const isSel = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full text-left p-4 flex items-start gap-3 transition-all outline-none ${
                isSel ? 'bg-indigo-950/25 border-l-2 border-indigo-500' : 'hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <p className="text-xs font-bold text-zinc-200 truncate">
                    {p.fullName ?? p.hn ?? '(ไม่มีชื่อ)'}
                  </p>
                  <StatusDot status={p.status} />
                </div>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  {p.hn ?? '-'} · {p.diagcode} · admit {p.datetimeAdmit}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.groups.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-red-950/60 text-red-400 rounded border border-red-900/30"
                    >
                      {g}
                    </span>
                  ))}
                  {p.groups.length === 0 && (
                    <span className="text-[9px] text-zinc-600 font-mono">
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
      <div className="px-4 py-2.5 border-t border-zinc-800/50 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-zinc-500 font-mono">
          {from}-{to} / {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1 || loading}
            onClick={() => onQueryChange({ page: page - 1 })}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-zinc-500 font-mono px-1">
            {page}/{maxPage}
          </span>
          <button
            disabled={page >= maxPage || loading}
            onClick={() => onQueryChange({ page: page + 1 })}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
