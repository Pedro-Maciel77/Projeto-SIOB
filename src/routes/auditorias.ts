import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../prisma/client';

const router = express.Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { evento, usuarioId } = req.query;

        const where: any = {};
        
        if (evento) where.evento = evento;
        if (usuarioId) where.usuarioId = parseInt(usuarioId as string);

        const auditorias = await prisma.auditoria.findMany({
            where,
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
                dataEvento: 'desc'
            }
        });
        res.json(auditorias);
    } catch (error) {
        console.error('Erro ao buscar auditorias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const auditoriaId = parseInt(id);

        const auditoria = await prisma.auditoria.findUnique({
            where: { id: auditoriaId },
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

        if (!auditoria) {
            return res.status(404).json({ error: 'Registro de auditoria não encontrado' });
        }

        res.json(auditoria);
    } catch (error) {
        console.error('Erro ao buscar auditoria:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { evento, descricao } = req.body;

        if (!evento) {
            return res.status(400).json({ error: 'Evento é obrigatório' });
        }

        const auditoria = await prisma.auditoria.create({
            data: {
                evento,
                descricao,
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

        res.status(201).json(auditoria);
    } catch (error) {
        console.error('Erro ao criar auditoria:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;