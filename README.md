# SIOB Backend

## Passos para rodar
1. Copie `.env.example` → `.env` e configure o banco PostgreSQL
2. `npm install`
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npm run dev`

Servidor: http://localhost:4000
