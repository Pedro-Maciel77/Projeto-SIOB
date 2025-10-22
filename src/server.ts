import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import ocorrenciasRoutes from './routes/ocorrencias';
import auditoriasRoutes from './routes/auditorias';
import relatoriosRoutes from './routes/relatorios';
import prisma from './prisma/client';
import e from 'express';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/ocorrencias', ocorrenciasRoutes);
app.use('/auditorias', auditoriasRoutes);
app.use('/relatorios', relatoriosRoutes);
app.get('/', (req, res) => res.json({ ok: true }));
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try { await prisma.$connect(); console.log('Connected to DB'); } catch (e) { console.error('DB connection error', e); }
});
export default app;