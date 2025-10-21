import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Dados em memória
const usuarios = [
  {
    id: '1',
    nome: 'Hugo Dantas',
    email: 'hugodantas777@gmail.com',
    cargo: 'Chefe',
    matricula: '1234567',
    unidade: '2ª Companhia'
  },
  {
    id: '2', 
    nome: 'Cauã Nunes',
    email: 'caua@bombeiros.com',
    cargo: 'ADM',
    matricula: '7654321',
    unidade: '1ª Companhia'
  }
];

const ocorrencias = [
  { id: '0', tipo: 'incendio', data: '21/10/2025', local: 'Dois Unidos', status: 'Aberta' },
  { id: '1', tipo: 'resgate', data: '08/12/2025', local: 'Afogados', status: 'Fechada' },
  { id: '2', tipo: 'resgate', data: '12/06/2023', local: 'Alto Bondade', status: 'Fechada' },
  { id: '3', tipo: 'acidente', data: '21/10/2025', local: 'Dois Unidos', status: 'Aberta' },
  { id: '4', tipo: 'acidente', data: '21/10/2025', local: 'Joao de Barros', status: 'Aberta' }
];

// Rotas de Autenticação
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  res.json({ 
    success: true, 
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo
    }
  });
});

app.post('/api/auth/registro', (req, res) => {
  const { nome, email, cpf, senha } = req.body;
  
  const novoUsuario = {
    id: (usuarios.length + 1).toString(),
    nome,
    email,
    cpf,
    cargo: 'Operador',
    matricula: Math.random().toString(36).substr(2, 9).toUpperCase(),
    unidade: 'Não informada'
  };

  usuarios.push(novoUsuario);
  
  res.json({ 
    success: true, 
    usuario: {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      cargo: novoUsuario.cargo
    }
  });
});

app.post('/api/auth/recuperar-senha', (req, res) => {
  const { email } = req.body;
  res.json({ 
    success: true, 
    message: 'Se existe uma conta com esse email, você receberá instruções em breve.' 
  });
});

// Rotas de Usuários
app.get('/api/usuarios', (req, res) => {
  res.json(usuarios);
});

app.post('/api/usuarios', (req, res) => {
  const { nome, email, cargo } = req.body;
  
  const novoUsuario = {
    id: (usuarios.length + 1).toString(),
    nome,
    email,
    cargo,
    matricula: Math.random().toString(36).substr(2, 9).toUpperCase(),
    unidade: 'Não informada'
  };

  usuarios.push(novoUsuario);
  res.json(novoUsuario);
});

// Rotas de Ocorrências
app.get('/api/ocorrencias', (req, res) => {
  res.json(ocorrencias);
});

app.get('/api/relatorios', (req, res) => {
  const { tipo, status, local } = req.query;
  
  let resultado = ocorrencias;
  
  if (tipo) {
    resultado = resultado.filter(o => o.tipo === tipo);
  }
  
  if (status) {
    resultado = resultado.filter(o => o.status === status);
  }
  
  if (local) {
    resultado = resultado.filter(o => o.local === local);
  }

  const stats = {
    total: resultado.length,
    abertas: resultado.filter(o => o.status === 'Aberta').length,
    fechadas: resultado.filter(o => o.status === 'Fechada').length,
    porTipo: {
      incendio: resultado.filter(o => o.tipo === 'incendio').length,
      resgate: resultado.filter(o => o.tipo === 'resgate').length,
      acidente: resultado.filter(o => o.tipo === 'acidente').length
    }
  };

  res.json({ ocorrencias: resultado, estatisticas: stats });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SIOB Backend está rodando!',
    usuarios: usuarios.length,
    ocorrencias: ocorrencias.length
  });
});

app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
});
