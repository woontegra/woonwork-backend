# WoonWork

Tamamen Türkçe, çok kiracılı (multi-tenant) şirket çalışma platformu.

## Teknoloji

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend:** Node.js + Express + TypeScript
- **Veritabanı:** PostgreSQL + Prisma
- **Auth:** JWT + refresh token

## Kurulum

```bash
npm install

# Ortam dosyaları
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# PostgreSQL çalışıyor olmalı (varsayılan: 127.0.0.1:5433)
npm run db:generate
npm run db:push
npm run db:seed

# Geliştirme (iki terminal)
npm run dev:api
npm run dev:web
```

- API: http://localhost:4000
- Web: http://localhost:5173

### Yerel Postgres (proje içi)

Sistem PostgreSQL 18 kuruluysa proje içinde ayrı bir cluster kullanılabilir:

```bash
# bir kez
initdb -D .data/postgres -U postgres -A trust --locale=C --encoding=UTF8
# postgresql.conf içine: port = 5433
pg_ctl -D .data/postgres -l .data/postgres/log.txt start
createdb -h 127.0.0.1 -p 5433 -U postgres woonwork
```

Seed giriş bilgileri `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` değerlerinden alınır.

## Monorepo

```
apps/web       — React arayüz
apps/api       — Express API
packages/shared — Ortak tipler ve Zod şemaları
```
