import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-2026';

// ======== AUTENTICAÇÃO ========
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verifica se já existe
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(400).json({ error: 'Este e-mail já está em uso.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 8);
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash }
    });

    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro no Banco: ' + (error.message || String(error)) });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      res.status(401).json({ error: 'E-mail ou senha incorretos' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'E-mail ou senha incorretos' });
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro no Banco (Login): ' + (error.message || String(error)) });
  }
});

// APLICANDO BLOQUEIO PARA TODAS AS ROTAS ABAIXO
router.use(authMiddleware);

// ======== DASHBOARD ========
router.get('/dashboard/summary', async (req, res) => {
  const userId = (req as any).userId;
  res.json({ status: 'ok', userId });
});

// ======== CONTAS BANCÁRIAS ========
router.get('/contas-bancarias', async (req, res) => {
  const userId = (req as any).userId;
  const data = await prisma.bankAccount.findMany({ where: { userId } });
  const formated = data.map(db => ({
    id: db.id,
    nome: db.name,
    tipo: db.type,
    saldo_inicial: db.initialBalance / 100,
    ativo: true,
    created_at: db.createdAt
  }));
  res.json(formated);
});

router.post('/contas-bancarias', async (req, res) => {
  const userId = (req as any).userId;
  const f = req.body;
  const db = await prisma.bankAccount.create({
    data: {
      userId,
      id: f.id,
      name: f.nome,
      type: f.tipo,
      initialBalance: Math.round(f.saldo_inicial * 100),
      currentBalance: Math.round(f.saldo_inicial * 100)
    }
  });
  res.json({ ...f, id: db.id });
});

router.put('/contas-bancarias/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const f = req.body;
  const exists = await prisma.bankAccount.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  const db = await prisma.bankAccount.update({
    where: { id },
    data: {
      name: f.nome,
      type: f.tipo,
      initialBalance: f.saldo_inicial !== undefined ? Math.round(f.saldo_inicial * 100) : undefined
    }
  });
  res.json(db);
});

router.delete('/contas-bancarias/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const exists = await prisma.bankAccount.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  await prisma.bankAccount.delete({ where: { id } });
  res.json({ success: true });
});

// ======== CLIENTES ========
router.get('/clientes', async (req, res) => {
  const userId = (req as any).userId;
  const data = await prisma.clientSupplier.findMany({ where: { userId } });
  const formated = data.map(db => ({
    id: db.id,
    nome: db.name,
    documento: db.document || '',
    telefone: db.phone || '',
    email: db.email || '',
    ativo: true,
    created_at: db.createdAt
  }));
  res.json(formated);
});

router.post('/clientes', async (req, res) => {
  const userId = (req as any).userId;
  const f = req.body;
  const db = await prisma.clientSupplier.create({
    data: {
      userId,
      id: f.id,
      name: f.nome,
      document: f.documento,
      phone: f.telefone,
      email: f.email,
      type: 'CLIENT'
    }
  });
  res.json({ ...f, id: db.id });
});

router.put('/clientes/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const f = req.body;
  const exists = await prisma.clientSupplier.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  const db = await prisma.clientSupplier.update({
    where: { id },
    data: {
      name: f.nome,
      document: f.documento,
      phone: f.telefone,
      email: f.email
    }
  });
  res.json(db);
});

router.delete('/clientes/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const exists = await prisma.clientSupplier.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  await prisma.clientSupplier.delete({ where: { id } });
  res.json({ success: true });
});

// ======== CATEGORIAS ========
router.get('/categorias', async (req, res) => {
  const userId = (req as any).userId;
  const data = await prisma.category.findMany({ where: { userId } });
  const formated = data.map(db => ({
    id: db.id,
    nome: db.name,
    tipo: db.description || 'operacional',
    cor: db.color || '#000000',
    ativo: true,
    created_at: db.createdAt
  }));
  res.json(formated);
});

router.post('/categorias', async (req, res) => {
  const userId = (req as any).userId;
  const f = req.body;
  const db = await prisma.category.create({
    data: {
      userId,
      id: f.id,
      name: f.nome,
      type: 'OUT',
      description: f.tipo,
      color: f.cor
    }
  });
  res.json({ ...f, id: db.id });
});

router.put('/categorias/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const f = req.body;
  const exists = await prisma.category.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  const db = await prisma.category.update({
    where: { id },
    data: {
      name: f.nome,
      description: f.tipo,
      color: f.cor
    }
  });
  res.json(db);
});

router.delete('/categorias/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const exists = await prisma.category.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  await prisma.category.delete({ where: { id } });
  res.json({ success: true });
});

// ======== CONTAS A RECEBER ========
router.get('/contas-receber', async (req, res) => {
  const userId = (req as any).userId;
  const data = await prisma.transaction.findMany({ where: { userId, type: 'IN' } });
  const formated = data.map(db => ({
    id: db.id,
    cliente_id: db.clientSupplierId || '',
    descricao: db.description,
    valor: db.amount / 100,
    data_vencimento: db.dueDate.toISOString().split('T')[0],
    data_recebimento: db.paymentDate ? db.paymentDate.toISOString().split('T')[0] : undefined,
    status: db.status === 'PAID' ? 'recebido' : (db.status === 'CANCELLED' ? 'cancelado' : 'previsto'),
    conta_bancaria_id: db.bankAccountId || undefined,
    competencia: db.dueDate.toISOString().substring(0, 7),
    created_at: db.createdAt,
    is_fixed_cost: db.isFixedCost
  }));
  res.json(formated);
});

router.post('/contas-receber', async (req, res) => {
  const userId = (req as any).userId;
  const f = req.body;
  
  // Garante uma categoria para as receitas
  let cat = await prisma.category.findFirst({ where: { userId, type: 'IN' } });
  if (!cat) {
    cat = await prisma.category.create({ data: { userId, name: 'Receitas', type: 'IN', description: 'operacional', color: '#10B981' } });
  }

  const db = await prisma.transaction.create({
    data: {
      userId,
      id: f.id,
      description: f.descricao || 'Recebimento',
      amount: Math.round(f.valor * 100),
      type: 'IN',
      status: f.status === 'recebido' ? 'PAID' : 'PENDING',
      dueDate: new Date(f.data_vencimento + 'T12:00:00Z'),
      paymentDate: f.data_recebimento ? new Date(f.data_recebimento + 'T12:00:00Z') : null,
      clientSupplierId: f.cliente_id,
      bankAccountId: f.conta_bancaria_id,
      categoryId: cat.id,
      isFixedCost: f.is_fixed_cost || false
    }
  });
  res.json(db);
});

router.put('/contas-receber/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const f = req.body;
  
  const exists = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  const data: any = {};
  if (f.descricao !== undefined) data.description = f.descricao;
  if (f.valor !== undefined) data.amount = Math.round(f.valor * 100);
  if (f.status) data.status = f.status === 'recebido' ? 'PAID' : 'PENDING';
  if (f.data_recebimento) data.paymentDate = new Date(f.data_recebimento + 'T12:00:00Z');
  if (f.conta_bancaria_id) data.bankAccountId = f.conta_bancaria_id;

  const db = await prisma.transaction.update({ where: { id }, data });
  res.json(db);
});

router.delete('/contas-receber/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const exists = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  await prisma.transaction.delete({ where: { id } });
  res.json({ success: true });
});

// ======== CONTAS A PAGAR ========
router.get('/contas-pagar', async (req, res) => {
  const userId = (req as any).userId;
  const data = await prisma.transaction.findMany({ 
    where: { userId, type: 'OUT' },
    include: { clientSupplier: true }
  });
  const formated = data.map(db => ({
    id: db.id,
    fornecedor: db.clientSupplier?.name || 'Fornecedor Avulso',
    categoria_id: db.categoryId,
    descricao: db.description,
    valor: db.amount / 100,
    data_vencimento: db.dueDate.toISOString().split('T')[0],
    data_pagamento: db.paymentDate ? db.paymentDate.toISOString().split('T')[0] : undefined,
    status: db.status === 'PAID' ? 'pago' : (db.status === 'CANCELLED' ? 'cancelado' : 'previsto'),
    conta_bancaria_id: db.bankAccountId || undefined,
    competencia: db.dueDate.toISOString().substring(0, 7),
    created_at: db.createdAt,
    // Parcelamento
    parcela_atual: db.installmentNumber || undefined,
    total_parcelas: db.totalInstallments || undefined,
    grupo_parcelamento: db.installmentGroupId || undefined,
    is_fixed_cost: db.isFixedCost
  }));
  res.json(formated);
});

router.post('/contas-pagar', async (req, res) => {
  const userId = (req as any).userId;
  const f = req.body;

  // Tenta achar ou criar Fornecedor
  let supplier = null;
  if (f.fornecedor) {
    supplier = await prisma.clientSupplier.findFirst({ where: { userId, name: f.fornecedor } });
    if (!supplier) {
      supplier = await prisma.clientSupplier.create({ data: { userId, name: f.fornecedor, type: 'SUPPLIER' } });
    }
  }

  const db = await prisma.transaction.create({
    data: {
      userId,
      id: f.id,
      description: f.descricao || 'Pagamento',
      amount: Math.round(f.valor * 100),
      type: 'OUT',
      status: f.status === 'pago' ? 'PAID' : 'PENDING',
      dueDate: new Date(f.data_vencimento + 'T12:00:00Z'),
      paymentDate: f.data_pagamento ? new Date(f.data_pagamento + 'T12:00:00Z') : null,
      clientSupplierId: supplier ? supplier.id : undefined,
      bankAccountId: f.conta_bancaria_id,
      categoryId: f.categoria_id,
      // Parcelamento
      installmentNumber: f.parcela_atual || null,
      totalInstallments: f.total_parcelas || null,
      installmentGroupId: f.grupo_parcelamento || null,
      isFixedCost: f.is_fixed_cost || false
    }
  });
  res.json(db);
});

router.post('/contas-pagar/bulk', async (req, res) => {
  const userId = (req as any).userId;
  const { parcelas } = req.body;

  if (!parcelas || !Array.isArray(parcelas) || parcelas.length === 0) {
    return res.status(400).json({ error: 'Nenhuma parcela fornecida.' });
  }

  try {
    // Tenta achar ou criar o Fornecedor com base na primeira parcela
    // Já que todas partilham do mesmo fornecedor num parcelamento.
    const fPrimeira = parcelas[0];
    let supplier = null;
    if (fPrimeira.fornecedor) {
      supplier = await prisma.clientSupplier.findFirst({ where: { userId, name: fPrimeira.fornecedor } });
      if (!supplier) {
        supplier = await prisma.clientSupplier.create({ data: { userId, name: fPrimeira.fornecedor, type: 'SUPPLIER' } });
      }
    }

    // Mapeando a estrutura da request para Prisma
    const dadosInsercao = parcelas.map((f: any) => ({
      userId,
      id: f.id,
      description: f.descricao || 'Pagamento',
      amount: Math.round(f.valor * 100),
      type: 'OUT',
      status: f.status === 'pago' ? 'PAID' : 'PENDING',
      dueDate: new Date(f.data_vencimento + 'T12:00:00Z'),
      paymentDate: f.data_pagamento ? new Date(f.data_pagamento + 'T12:00:00Z') : null,
      clientSupplierId: supplier ? supplier.id : undefined,
      bankAccountId: f.conta_bancaria_id,
      categoryId: f.categoria_id,
      installmentNumber: f.parcela_atual || null,
      totalInstallments: f.total_parcelas || null,
      installmentGroupId: f.grupo_parcelamento || null,
      isFixedCost: f.is_fixed_cost || false
    }));

    // Cria as transações numa operação bulk "Tudo ou Nada"
    const count = await prisma.transaction.createMany({
      data: dadosInsercao
    });

    res.json({ success: true, count: count.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar parcelas em lote.' });
  }
});

router.put('/contas-pagar/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const f = req.body;

  const exists = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  const data: any = {};
  if (f.descricao !== undefined) data.description = f.descricao;
  if (f.valor !== undefined) data.amount = Math.round(f.valor * 100);
  if (f.status) data.status = f.status === 'pago' ? 'PAID' : 'PENDING';
  if (f.data_pagamento) data.paymentDate = new Date(f.data_pagamento + 'T12:00:00Z');
  if (f.conta_bancaria_id) data.bankAccountId = f.conta_bancaria_id;

  const db = await prisma.transaction.update({ where: { id }, data });
  res.json(db);
});

router.delete('/contas-pagar/:id', async (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const exists = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!exists) { res.status(404).json({ error: 'Não encontrado' }); return; }

  await prisma.transaction.delete({ where: { id } });
  res.json({ success: true });
});

export default router;

