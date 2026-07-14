/**
 * API client — ห่อ fetch สำหรับเรียก Drug Allergy Card API
 *
 * dev: เรียกผ่าน Vite proxy (/auth, /api → backend :3000) → ใช้ base '' (same-origin)
 * prod: ตั้ง VITE_API_BASE เป็น URL เต็มของ service (เช่น https://.../drugallergy)
 *
 * แนบ Bearer token (session ของระบบเรา) อัตโนมัติจาก tokenStore
 */

const BASE: string = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

const TOKEN_KEY = 'emac_session_token';

export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error ?? {};
    throw new ApiError(
      res.status,
      err.code ?? 'ERROR',
      err.message ?? `Request failed (${res.status})`,
    );
  }
  return data as T;
}

// ---- Types (สะท้อน response ของ API) ----

export interface MockProfile {
  providerId: string;
  name: string;
  role: string;
  hospcode: string;
  hospitalName: string;
  isMedicalPersonnel: boolean;
}

export interface Identity {
  providerId: string;
  hospcode: string;
  hospitalName: string;
  role: 'doctor' | 'pharmacist';
  name: string;
  keyId: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  profile: {
    providerId: string;
    name: string;
    role: string;
    hospcode: string;
    hospitalName: string;
    keyId: string;
  };
}

// ---- Patient types (P3) ----

export type PatientStatus = 'pending' | 'verified' | 'rejected';

export interface SuspectDrug {
  didstd: string;
  dname: string;
  dateServ: string;
  group: string | null;
}

export type Sex = 'male' | 'female' | 'other';

export interface PatientListItem {
  id: string;
  hn: string | null;
  pid: string;
  fullName: string | null;
  sex: Sex | null;
  diagcode: string;
  datetimeAdmit: string;
  status: PatientStatus;
  drugCount: number;
  groups: string[];
  updatedAt: string;
}

export interface PatientDetail extends PatientListItem {
  cid: string | null;
  birthDate: string | null;
  address: string | null;
  suspectDrugs: SuspectDrug[];
  nsaidGroups: string[];
  systemicNsaids: string[];
  antibioticGroups: string[];
  otherGroups: string[];
  note: string | null;
  sourceHospcode: string;
  sourceLoadedAt: string;
}

// ---- Verification (P4) ----

export type Severity = 'mild' | 'moderate' | 'severe' | 'life-threatening';
export type AssessmentCode = '1' | '2' | '3' | 'H';

export interface ConfirmedDrug {
  didstd: string;
  dname: string;
  group: string | null;
  adverseReaction?: string;
  assessment?: AssessmentCode;
}

export interface VerifyInput {
  confirmedDrugs: ConfirmedDrug[];
  biomarker?: string;
  severity: Severity;
  manifestations: string[];
  crossReactiveDrugs: string[];
  alternativeDrugs: string[];
  note?: string;
}

export interface VerificationRecord {
  id: string;
  patientId: string;
  providerId: string;
  hospcode: string;
  decision: 'verified';
  confirmedDrugs: ConfirmedDrug[];
  biomarker: string | null;
  severity: Severity;
  manifestations: string[];
  crossReactiveDrugs: string[];
  alternativeDrugs: string[];
  note: string | null;
  canonicalPayload: string;
  signature: string;
  signatureAlg: string;
  keyId: string;
  signedAt: string;
}

// ---- Cards (P5) ----

export interface CardLinks {
  id: string;
  renderToken: string;
  issuedAt: string;
  verifyUrl: string;
  embedUrl: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PatientListQuery {
  status?: PatientStatus;
  q?: string;
  diagcode?: string;
  admitFrom?: string;
  admitTo?: string;
  group?: string;
  page?: number;
  pageSize?: number;
}

function toQueryString(query: PatientListQuery): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

// ---- OAuth (real mode) ----

/**
 * URL สำหรับ redirect ทั้งหน้าไปเริ่ม OAuth flow (backend จะ 302 ต่อไป Provider ID)
 * ใช้กับ window.location.href — ไม่ใช่ fetch (เพราะเป็น redirect ข้าม origin)
 */
export function oauthLoginUrl(state?: string): string {
  const qs = state ? `?state=${encodeURIComponent(state)}` : '';
  return `${BASE}/auth/login${qs}`;
}

// ---- Endpoints ----

export const api = {
  /** mock | real — ให้ frontend เลือก UI login ให้ถูกโหมด */
  getAuthMode(): Promise<{ mode: 'mock' | 'real' }> {
    return request('/auth/mode');
  },
  getProviders(): Promise<{ providers: MockProfile[] }> {
    return request('/auth/providers');
  },
  login(providerId: string): Promise<LoginResponse> {
    return request('/auth/session', {
      method: 'POST',
      body: JSON.stringify({ providerId }),
    });
  },
  /** (real) แลก authorization code จาก Provider ID เป็น session JWT */
  loginWithCode(code: string): Promise<LoginResponse> {
    return request('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
  getMe(): Promise<{ identity: Identity }> {
    return request('/auth/me');
  },
  listPatients(query: PatientListQuery = {}): Promise<Paginated<PatientListItem>> {
    return request(`/api/v1/patients${toQueryString(query)}`);
  },
  getPatient(id: string): Promise<{ patient: PatientDetail }> {
    return request(`/api/v1/patients/${encodeURIComponent(id)}`);
  },
  verifyPatient(
    id: string,
    input: VerifyInput,
  ): Promise<{ verification: VerificationRecord; card: CardLinks }> {
    return request(`/api/v1/patients/${encodeURIComponent(id)}/verify`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  getPatientCard(id: string): Promise<{ links: CardLinks }> {
    return request(`/api/v1/patients/${encodeURIComponent(id)}/card`);
  },
  rejectPatient(id: string, reason: string): Promise<{ status: string }> {
    return request(`/api/v1/patients/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  updateNote(id: string, note: string): Promise<{ status: string }> {
    return request(`/api/v1/patients/${encodeURIComponent(id)}/note`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  },
};
