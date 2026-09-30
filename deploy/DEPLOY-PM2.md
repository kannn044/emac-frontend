# Deploy: frontend + backend แยกเครื่อง ใช้ PM2

ใช้ Node.js 20 ขึ้นไปและ PM2 ที่ติดตั้งแล้ว อัปโหลดโค้ดที่แก้ไปแต่ละเครื่องก่อน

```
emac.moph.go.th → nginx → PM2 emac-web 127.0.0.1:4180 (dist)
  /auth/, /api/, /embed/ → https://api-mophlink.moph.go.th/drugallergy/...
    → nginx → PM2 emac-api :3100 (คง prefix /drugallergy)
```

## 1. Backend: /home/gdata/emac-backend

คง `.env` เดิมที่มี DATABASE_URL, SESSION_JWT_SECRET และค่าฐานข้อมูลไว้
PM2 config ชุดนี้กำหนด PORT=3100, HTTP_BASE_PATH=/drugallergy,
PUBLIC_BASE_URL=https://api-mophlink.moph.go.th/drugallergy, TRUST_PROXY=true,
AUTH_PROVIDER=mock โดยมีผลเหนือค่าเดียวกันใน `.env`
ไม่ได้เปลี่ยน datastore เป็น memory หรือเปลี่ยน secret

```bash
cd /home/gdata/emac-backend
npm ci
pm2 startOrRestart ecosystem.config.cjs --only emac-api --update-env
pm2 save
curl -i http://127.0.0.1:3100/drugallergy/auth/mode
```

ต้องได้ HTTP 200 `{"mode":"mock"}`

ใน nginx.conf ระดับ `http {}` (นอก server block) แก้ upstream เดิมเป็น:

```nginx
upstream drugallergy_upstream {
    server 127.0.0.1:3100;
    keepalive 32;
}
```

คง location `/drugallergy/` และ `/drugallergy/healthz` ที่มีอยู่
โดยใช้ `proxy_pass http://drugallergy_upstream;` ไม่มี slash ต่อท้าย
คง `/dms/` ตามเดิม ไม่คัดลอก template ไปทับ service อื่น
คง `limit_req_zone ... zone=drugallergy_rl:...` เดิมไว้ใน http block อย่าประกาศซ้ำ

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -i https://api-mophlink.moph.go.th/drugallergy/auth/mode
```

## 2. Frontend: /home/gdata/emac/emac-frontend

`.env.production` และ `.env.production-emac` ตั้งค่าเหมือนกัน:

```dotenv
VITE_API_BASE=
VITE_BASE_PATH=/
VITE_ALLOWED_HOSTS=emac.moph.go.th
```

ตรวจว่า shell/CI หรือ `.env.production.local` ไม่กำหนด VITE_API_BASE เป็นค่าเก่า

```bash
cd /home/gdata/emac/emac-frontend
npm ci
npm run build
pm2 startOrRestart ecosystem.config.cjs --only emac-web --update-env
pm2 save
curl -I http://127.0.0.1:4180/
sudo mkdir -p /etc/nginx/snippets
sudo cp deploy/snippets/emac-api-proxy.conf /etc/nginx/snippets/emac-api-proxy.conf
```

ใน HTTPS server block ของ emac.moph.go.th:

- คง SSL, security headers และ location `/auth/`, `/api/`, `/embed/`, `/healthz` เดิม
- ลบ `root /var/www/emac-frontend/dist;` และ `index index.html;`
- ลบ location `/assets/` เดิมทั้ง block เพื่อให้ assets เข้า PM2 เช่นเดียวกับหน้าเว็บ
- เปลี่ยน location `/` เดิมเป็น:

```nginx
location / {
    proxy_pass http://127.0.0.1:4180;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

ไฟล์ `deploy/nginx-emac.conf` เป็นตัวอย่าง config เต็มที่ตรงกับชุดนี้
อย่าเพิ่ม server block ซ้ำกับ domain เดิม และคง limit_req_zone ของ emac_rl ไว้ใน http block

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -i https://api-mophlink.moph.go.th/drugallergy/auth/mode
curl -i https://emac.moph.go.th/auth/mode
curl -i https://emac.moph.go.th/auth/providers
```

สองคำสั่ง auth/mode ต้องตอบ HTTP 200 `{"mode":"mock"}`; auth/providers ต้องเป็น JSON รายชื่อ
จากนั้นเปิดเว็บใหม่แบบ hard refresh แล้วทดสอบเลือก mock account และเปิดรายการผู้ป่วย

หาก curl ไป backend ได้ แต่ nginx ขึ้น 502 ให้ดู `/var/log/nginx/error.log`:
ถ้าเป็น SELinux `Permission denied` บน RHEL/Rocky/Alma ใช้
`sudo setsebool -P httpd_can_network_connect 1` บนเครื่องที่ nginx ถูกปฏิเสธ

## หลัง reboot และการตรวจปัญหา

แต่ละเครื่องเรียก `pm2 startup` ด้วย user ที่รันแอป แล้วทำตามคำสั่งที่ PM2 แสดง
ตามด้วย `pm2 save` เพื่อให้ process กลับมาหลัง reboot

- frontend: `pm2 logs emac-web --lines 50`
- backend: `pm2 logs emac-api --lines 50` ตรวจ port=3100 และ basePath=/drugallergy
- API 404: ตรวจ prefix และว่า request ไปถึง backend หรือไม่
- API ได้ HTML: ตรวจ location proxy และ bundle เก่า
- 502/504: ตรวจ process, DNS, TLS และ firewall ระหว่างสองเครื่อง

## การตรวจในเครื่องพัฒนา

Frontend: `npm run build && npm run test:deploy`
Backend: `npm test -- test/e2e/base-path.test.ts test/e2e/auth.test.ts`

การทดสอบในเครื่องไม่ยืนยัน DNS/firewall/TLS หรือ nginx ที่ติดตั้งจริงบน Linux
