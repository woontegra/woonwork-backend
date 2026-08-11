# WoonWork Backend (API)

Railway'e deploy edilen bağımsız Express API.

## Lokal

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Railway

- Root Directory: **boş**
- Builder: **Nixpacks** (Dockerfile yok)
- Env: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`
