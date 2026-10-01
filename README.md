# eMAC Hospital Portal (Frontend)

หน้าเว็บฝั่งโรงพยาบาลของระบบบัตรแพ้ยาอิเล็กทรอนิกส์ (eMAC) — แพทย์/เภสัชกร ตรวจสอบและออกบัตรแพ้ยา
เชื่อมต่อกับ **Drug Allergy Card API** (`../emac-backend`)

React 19 + Vite + Tailwind — production: **https://emac.moph.go.th**

## ภาพรวม

```
เบราว์เซอร์ ──► emac.moph.go.th (nginx → PM2 เสิร์ฟ dist/)
                  ├─ /auth/*, /api/*, /embed/*  → proxy ไป api-mophlink.moph.go.th/drugallergy
                  └─ /* → index.html (SPA)
```

frontend เรียก API แบบ **same-origin** (`VITE_API_BASE` ว่าง) — nginx บนเครื่อง emac
proxy ต่อไป backend จึงไม่ติด CORS · การ login ใช้ **MOPH Provider ID (OAuth2)** ผ่าน backend

## สถานะการพัฒนา

| Phase | ขอบเขต | สถานะ |
|-------|--------|-------|
| **P1** | Login + session + app shell (mock สำหรับ dev / **Provider ID จริงสำหรับ production**) | ✅ |
| **P2** | คิวผู้ป่วย + รายละเอียด ดึงจาก API แบบ tenant-scoped (search/filter/paging) | ✅ |
| **P3** | Verify workspace: เลือกยา + กรอกคลินิก + ลงนามดิจิทัล / reject / note | ✅ |
| **P4** | แสดงบัตรที่ออกแล้ว + QR ตรวจความแท้ + เปิด/พิมพ์บัตร (embed) | ✅ |

## การเข้าสู่ระบบ

หน้า login เช็ค `GET /auth/mode` จาก backend แล้วเลือก UI อัตโนมัติ:

- **`real`** (production) — ปุ่ม "เข้าสู่ระบบด้วย Provider ID" → redirect ไป MOPH Provider ID
  → login สำเร็จ backend เด้ง `?code` กลับมา → `AuthContext` แลก code เป็น session JWT
  (ตรวจ `state` กัน CSRF ให้อัตโนมัติ)
- **`mock`** (dev) — เลือกบัญชีจำลองจาก `GET /auth/providers` (เภสัชกร/แพทย์ ต่าง รพ.)

## รันในเครื่อง (dev)

ต้องรัน **2 ตัว**: backend API + frontend นี้

**1) Backend** (โฟลเดอร์ `../emac-backend`) — dev ไม่ต้องมี Postgres:

```bash
cd ../emac-backend
npm install
AUTH_PROVIDER=mock KEY_STORE=memory DATA_STORE=memory SESSION_JWT_SECRET=dev-secret npm run dev
# → http://localhost:3000
```

**2) Frontend** (โฟลเดอร์นี้):

```bash
npm install
npm run dev        # → http://localhost:5173
```

Vite dev server proxy `/auth`, `/api`, `/embed` ไป backend อัตโนมัติ
(ตั้งเป้าหมายที่ `VITE_API_PROXY_TARGET` ใน `.env.local`)

## Build & Deploy (สอง server + PM2)

ทำตาม [deploy/DEPLOY-PM2.md](deploy/DEPLOY-PM2.md) เป็นคู่มือหลัก

- Frontend: `/home/gdata/emac/emac-frontend`, PM2 `emac-web`, `127.0.0.1:4180`
- Backend: `/home/gdata/emac-backend`, PM2 `emac-api`, port `3100`, prefix `/drugallergy`
- `npm run build` และ `npm run build:emac` ใช้ root domain และ same-origin API เหมือนกัน
- `npm start` เสิร์ฟ `dist/` ผ่าน Node; Nginx ส่ง API ไป backend domain
- `ecosystem.emac.config.cjs` เป็น alias ของ `ecosystem.config.cjs`

## โครงสร้าง

```
lib/apiClient.ts        fetch wrapper + Bearer token + typed endpoints + oauthLoginUrl
lib/AuthContext.tsx     สถานะ session ทั้งแอป (login/logout/restore + OAuth callback)
components/
  LoginScreen.tsx       หน้า login (real: ปุ่ม Provider ID / mock: เลือกบัญชี)
  PatientQueue.tsx      คิวผู้ป่วย (filter/search/paging)
  PatientDetail.tsx     รายละเอียด + verify workspace
  CardView.tsx          บัตรแพ้ยา + QR
App.tsx                 gate: login ↔ portal
```

## Portal authentication separated from third-party API

Frontend authentication uses `/api/v1/portal/auth/*` (mode, providers, session, login, callback, me).
Set `PORTAL_AUTH_PROVIDER=mock` in the backend for the demo account picker.
Third-party `/auth/*` and `/api/v1/drugallergy/search` always use real Provider ID and real Parquet,
regardless of portal mode. Portal tokens cannot call third-party search or refresh endpoints.
Deploy both repositories together and rebuild this frontend with `npm run build:emac`.
Existing nginx `/api/` proxy handles these routes; no new location is needed.
Existing sessions must log in again after this update.
