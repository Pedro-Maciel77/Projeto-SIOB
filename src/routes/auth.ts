import express from 'express';
import jwt from 'jsonwebtoken';
import { hashSenha, compararSenha } from '../utils/hash';
import prisma from '../prisma/client';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const senhaValida = await compararSenha(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { 
                userId: usuario.id, 
                email: usuario.email,
                cargo: usuario.cargo
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                cpf: usuario.cpf,
                cargo: usuario.cargo,
                matricula: usuario.matricula,
                unidade: usuario.unidade,
                criadoEm: usuario.criadoEm
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.post('/registrar', async (req, res) => {
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
            }
        });

        const token = jwt.sign(
            { 
                userId: novoUsuario.id, 
                email: novoUsuario.email,
                cargo: novoUsuario.cargo
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                cpf: novoUsuario.cpf,
                cargo: novoUsuario.cargo,
                matricula: novoUsuario.matricula,
                unidade: novoUsuario.unidade,
                criadoEm: novoUsuario.criadoEm
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;