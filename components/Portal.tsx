/**
 * Portal (P3) — คอนเทนเนอร์หลักฝั่งโรงพยาบาล: คิวผู้ป่วย (ซ้าย) + รายละเอียด (ขวา)
 * ดึงข้อมูลจาก API แบบ tenant-scoped (เห็นเฉพาะ รพ. ของ session)
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import {
  api,
  ApiError,
  type PatientDetail as Detail,
  type PatientListItem,
  type PatientListQuery,
} from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';
import { PatientQueue } from './PatientQueue';
import { PatientDetail } from './PatientDetail';

export const Portal: React.FC = () => {
  const { identity } = useAuth();

  const [query, setQuery] = useState<PatientListQuery>({ page: 1, pageSize: 20 });
  const [items, setItems] = useState<PatientListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // fetch list (debounce เพื่อรองรับการพิมพ์ค้นหา)
  const fetchList = useCallback((qy: PatientListQuery) => {
    setListLoading(true);
    setListError(null);
    api
      .listPatients(qy)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((e) => {
        setListError(e instanceof ApiError ? e.message : 'โหลดคิวไม่สำเร็จ');
        setItems([]);
        setTotal(0);
      })
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchList(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchList, reloadKey]);

  // fetch detail เมื่อเลือกผู้ป่วย
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetailLoading(true);
    setDetailError(null);
    api
      .getPatient(selectedId)
      .then((res) => {
        if (active) setDetail(res.patient);
      })
      .catch((e) => {
        if (active) {
          setDetailError(e instanceof ApiError ? e.message : 'โหลดรายละเอียดไม่สำเร็จ');
          setDetail(null);
        }
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId, reloadKey]);

  const patchQuery = (patch: Partial<PatientListQuery>) =>
    setQuery((prev) => ({ ...prev, ...patch }));

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm min-h-[70vh]">
        {/* Bar */}
        <div className="px-6 py-4 bg-[var(--surface-2)] border-b border-[var(--border-soft)] flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--tint)] rounded-xl flex items-center justify-center border border-[var(--line)] text-[var(--primary)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">ทะเบียนผู้ป่วยแพ้ยา</h2>
            <p className="text-xs text-[var(--muted)]">
              tenant-scoped · เห็นเฉพาะ รพ. {identity?.hospcode}
            </p>
          </div>
        </div>

        {/* Split */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          <PatientQueue
            items={items}
            total={total}
            loading={listLoading}
            error={listError}
            query={query}
            onQueryChange={patchQuery}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <PatientDetail detail={detail} loading={detailLoading} error={detailError} onChanged={reload} />
        </div>
      </div>
    </main>
  );
};
