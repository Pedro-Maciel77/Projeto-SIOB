import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../prisma/client';

const router = express.Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { status, tipo } = req.query;

        const where: any = {};
        
        if (status) where.status = status;
        if (tipo) where.tipo = tipo;

        const ocorrencias = await prisma.ocorrencia.findMany({
            where,
            include: {
                responsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        cargo: true
                    }
                }
            },
            orderBy: {
                dataOcorrencia: 'desc'
            }
        });
        res.json(ocorrencias);
    } catch (error) {
        console.error('Erro ao buscar ocorrências:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { tipo, dataOcorrencia, local, descricao, responsavelId } = req.body;

        if (!tipo || !dataOcorrencia || !local) {
            return res.status(400).json({ error: 'Tipo, data e local são obrigatórios' });
        }

        const novaOcorrencia = await prisma.ocorrencia.create({
            data: {
                tipo,
                dataOcorrencia: new Date(dataOcorrencia),
                local,
                descricao,
                status: 'Aberta',
                responsavelId: responsavelId || req.userId
            },
            include: {
                responsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        cargo: true
                    }
                }
            }
        });

        res.status(201).json(novaOcorrencia);
    } catch (error) {
        console.error('Erro ao criar ocorrência:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const ocorrenciaId = parseInt(id);

        const ocorrencia = await prisma.ocorrencia.findUnique({
            where: { id: ocorrenciaId },
            include: {
                responsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        cargo: true
                    }
                }
            }
        });

        if (!ocorrencia) {
            return res.status(404).json({ error: 'Ocorrência não encontrada' });
        }

        res.json(ocorrencia);
    } catch (error) {
        console.error('Erro ao buscar ocorrência:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { tipo, dataOcorrencia, local, status, descricao, responsavelId } = req.body;
        const ocorrenciaId = parseInt(id);

        const ocorrenciaAtualizada = await prisma.ocorrencia.update({
            where: { id: ocorrenciaId },
            data: {
                tipo,
                dataOcorrencia: dataOcorrencia ? new Date(dataOcorrencia) : undefined,
                local,
                status,
                descricao,
                responsavelId
            },
            include: {
                responsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        cargo: true
                    }
                }
            }
        });

        res.json(ocorrenciaAtualizada);
    } catch (error) {
        console.error('Erro ao atualizar ocorrência:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const ocorrenciaId = parseInt(id);

        await prisma.ocorrencia.delete({
            where: { id: ocorrenciaId }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar ocorrência:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;