import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../prisma/client';
import { hashSenha } from '../utils/hash';

const router = express.Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                cargo: true,
                matricula: true,
                unidade: true,
                criadoEm: true
            },
            orderBy: {
                nome: 'asc'
            }
        });
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const usuarioId = parseInt(id);

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                cargo: true,
                matricula: true,
                unidade: true,
                criadoEm: true
            }
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { nome, email, cpf, senha, cargo, matricula, unidade } = req.body;

        if (!nome || !email || !cpf || !senha) {
            return res.status(400).json({ error: 'Nome, email, CPF e senha são obrigatórios' });
        }

        const usuarioExistente = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { email },
                    { cpf }
                ]
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: 'Email ou CPF já cadastrado' });
        }

        const senhaHash = await hashSenha(senha);

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                cpf,
                senha: senhaHash,
                cargo: cargo || 'Operador',
                matricula,
                unidade
            },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                cargo: true,
                matricula: true,
                unidade: true,
                criadoEm: true
            }
        });

        res.status(201).json(novoUsuario);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { nome, email, cpf, cargo, matricula, unidade } = req.body;
        const usuarioId = parseInt(id);

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: usuarioId },
            data: {
                nome,
                email,
                cpf,
                cargo,
                matricula,
                unidade
            },
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                cargo: true,
                matricula: true,
                unidade: true,
                criadoEm: true
            }
        });

        res.json(usuarioAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const usuarioId = parseInt(id);

        await prisma.usuario.delete({
            where: { id: usuarioId }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;