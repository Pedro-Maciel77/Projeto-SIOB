import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../prisma/client';

const router = express.Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const relatorios = await prisma.relatorio.findMany({
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        cargo: true
                    }
                }
            },
            orderBy: {
                dataGeracao: 'desc'
            }
        });
        res.json(relatorios);
    } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { filtros } = req.body;

        const relatorio = await prisma.relatorio.create({
            data: {
                filtros,
                usuarioId: req.userId
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        cargo: true
                    }
                }
            }
        });

        res.status(201).json(relatorio);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const relatorioId = parseInt(id);

        const relatorio = await prisma.relatorio.findUnique({
            where: { id: relatorioId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        cargo: true
                    }
                }
            }
        });

        if (!relatorio) {
            return res.status(404).json({ error: 'Relatório não encontrado' });
        }

        res.json(relatorio);
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;