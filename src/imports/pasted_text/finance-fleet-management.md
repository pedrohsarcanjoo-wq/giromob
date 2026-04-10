# PROMPT — SISTEMA FINANCEIRO & GESTÃO DE FROTA
> Pronto para uso no Antigravity — Next.js + Supabase — Full Stack

---

## CONTEXTO

Crie um sistema web completo de **gestão financeira para empresas transportadoras**.
O sistema deve ser construído com **Next.js (App Router) + Supabase** (auth, banco de dados PostgreSQL e RLS).
O design deve ser profissional, clean e responsivo, com sidebar de navegação lateral.

---

## STACK OBRIGATÓRIA

- **Frontend:** Next.js 14+ com App Router, TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS)
- **UI Components:** shadcn/ui
- **Gráficos:** Recharts
- **Formulários:** React Hook Form + Zod
- **Estado:** Context API ou Zustand

---

## BANCO DE DADOS — SCHEMAS SQL

Execute os seguintes SQLs no Supabase para criar as tabelas:

```sql
-- CONTAS BANCÁRIAS
CREATE TABLE contas_bancarias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome varchar(100) NOT NULL,
  tipo varchar(30) NOT NULL CHECK (tipo IN ('conta_corrente', 'caixa', 'carteira_digital')),
  saldo_inicial numeric(15,2) NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- CLIENTES
CREATE TABLE clientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome varchar(150) NOT NULL,
  documento varchar(20),
  telefone varchar(20),
  email varchar(100),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- CATEGORIAS DE CUSTO
CREATE TABLE categorias_custo (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome varchar(80) NOT NULL,
  tipo varchar(30) NOT NULL CHECK (tipo IN ('operacional', 'administrativo', 'financeiro')),
  cor varchar(7) DEFAULT '#6B7280',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- CONTAS A RECEBER
CREATE TABLE contas_receber (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES clientes(id),
  descricao text,
  valor numeric(15,2) NOT NULL,
  data_vencimento date NOT NULL,
  data_recebimento date,
  status varchar(20) NOT NULL DEFAULT 'previsto'
    CHECK (status IN ('previsto', 'recebido', 'cancelado')),
  conta_bancaria_id uuid REFERENCES contas_bancarias(id),
  competencia date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- CONTAS A PAGAR
CREATE TABLE contas_pagar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor varchar(150) NOT NULL,
  categoria_id uuid REFERENCES categorias_custo(id),
  descricao text,
  valor numeric(15,2) NOT NULL,
  data_vencimento date NOT NULL,
  data_pagamento date,
  status varchar(20) NOT NULL DEFAULT 'previsto'
    CHECK (status IN ('previsto', 'pago', 'cancelado')),
  conta_bancaria_id uuid REFERENCES contas_bancarias(id),
  competencia date NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## MÓDULOS E PÁGINAS

### 1. LAYOUT GLOBAL

Sidebar fixa à esquerda com navegação entre módulos:
- Dashboard
- Fluxo de Caixa
- Contas a Receber
- Contas a Pagar
- Contas Bancárias
- Categorias de Custo
- DRE
- Histórico & Relatórios
- Score Financeiro

Header com nome do sistema e nome do usuário logado.

---

### 2. DASHBOARD (`/dashboard`)

Exibir os seguintes KPIs em cards:

| Card | Cálculo |
|---|---|
| Faturamento do Mês | SUM de contas_receber WHERE status='recebido' AND data_recebimento no mês atual |
| Despesas do Mês | SUM de contas_pagar WHERE status='pago' AND data_pagamento no mês atual |
| Lucro / Prejuízo | Faturamento - Despesas (verde se positivo, vermelho se negativo) |
| Saldo Atual | SUM saldo_inicial + entradas recebidas - saídas pagas de todas as contas_bancarias ativas |
| Saldo Projetado | Saldo Atual + SUM contas_receber previstas - SUM contas_pagar previstas |

**Alertas visuais (badges):**
- Contas a pagar vencidas (data_vencimento < hoje AND status='previsto') → badge vermelho
- Contas a receber vencidas (data_vencimento < hoje AND status='previsto') → badge laranja

**Gráficos:**
- Linha: evolução do saldo bancário nos últimos 6 meses
- Barra: receitas vs despesas dos últimos 6 meses
- Pizza: distribuição de despesas por categoria_custo no mês atual

---

### 3. CONTAS A RECEBER (`/contas-receber`)

**Listagem:**
- Tabela com colunas: Cliente, Descrição, Valor, Vencimento, Competência, Status, Ações
- Filtros: status, mês de vencimento, cliente
- Status com badge colorido: Previsto (azul), Recebido (verde), Cancelado (cinza)
- Botão "Confirmar Recebimento" inline para itens com status 'previsto'
  - Ao confirmar: atualizar status para 'recebido', preencher data_recebimento com hoje, vincular conta_bancaria_id

**Formulário de criação/edição (modal ou drawer):**
- Cliente (select com busca)
- Descrição (textarea, opcional)
- Valor (input numérico com máscara R$)
- Data de Vencimento (datepicker)
- Competência (mês/ano — separado da data de vencimento)
- Status (select)
- Conta Bancária (select, opcional)

**Regra crítica:** O saldo da conta bancária só é alterado quando status mudar para 'recebido'.

---

### 4. CONTAS A PAGAR (`/contas-pagar`)

**Listagem:**
- Tabela com colunas: Fornecedor, Categoria, Valor, Vencimento, Competência, Status, Ações
- Filtros: status, categoria, mês de vencimento
- Destacar em vermelho linhas com vencimento ultrapassado e status 'previsto'
- Botão "Confirmar Pagamento" inline para itens com status 'previsto'
  - Ao confirmar: atualizar status para 'pago', preencher data_pagamento com hoje, vincular conta_bancaria_id

**Formulário de criação/edição (modal ou drawer):**
- Fornecedor (input texto)
- Categoria (select de categorias_custo)
- Descrição (textarea, opcional)
- Valor (input numérico com máscara R$)
- Data de Vencimento (datepicker)
- Competência (mês/ano)
- Status (select)
- Conta Bancária (select, opcional)

**Regra crítica:** O saldo da conta bancária só é alterado quando status mudar para 'pago'.

---

### 5. FLUXO DE CAIXA (`/fluxo-caixa`)

Exibir em tabela mensal (linhas = dias ou semanas, colunas = tipo):

| Componente | Fonte |
|---|---|
| Saldo Inicial do Período | Saldo real das contas bancárias no início do mês |
| (+) Entradas Realizadas | contas_receber WHERE status='recebido' no mês |
| (+) Entradas Previstas | contas_receber WHERE status='previsto' no mês |
| (-) Saídas Realizadas | contas_pagar WHERE status='pago' no mês |
| (-) Saídas Previstas | contas_pagar WHERE status='previsto' no mês |
| = Saldo Final Projetado | Saldo Inicial + todas as entradas - todas as saídas |

Filtro de período: seletor de mês/ano.
Gráfico de linha mostrando evolução do saldo ao longo do mês selecionado.

---

### 6. CONTAS BANCÁRIAS (`/contas-bancarias`)

**Listagem em cards**, um por conta, exibindo:
- Nome da conta
- Tipo (badge)
- Saldo atual calculado (saldo_inicial + entradas recebidas - saídas pagas)
- Saldo projetado (saldo atual + previstos)
- Botões: Editar, Ativar/Desativar

**Formulário de criação/edição:**
- Nome
- Tipo (conta_corrente | caixa | carteira_digital)
- Saldo Inicial

**Regra:** Não permitir exclusão de conta com lançamentos vinculados. Apenas desativar.

---

### 7. CATEGORIAS DE CUSTO (`/categorias`)

Listagem simples em tabela:
- Nome, Tipo, Cor (preview colorido), Ativo, Ações (editar, ativar/desativar)

Formulário: Nome, Tipo (operacional | administrativo | financeiro), Cor (color picker).

Pré-popular com as categorias padrão:
- Combustível (operacional, #EF4444)
- Manutenção (operacional, #F97316)
- Salário Motorista (operacional, #8B5CF6)
- Pedágio (operacional, #06B6D4)
- Seguro (operacional, #10B981)
- Administrativo (administrativo, #6B7280)
- Financeiro (financeiro, #3B82F6)

---

### 8. DRE (`/dre`)

Seletor de mês/ano no topo.

Exibir tabela estruturada por regime de competência (campo `competencia`, não data de pagamento):

```
(+) RECEITA BRUTA
    Clientes / Fretes ..........  R$ X.XXX,XX

(-) CUSTOS OPERACIONAIS
    Combustível ................  R$ X.XXX,XX
    Manutenção .................  R$ X.XXX,XX
    Salário Motorista ..........  R$ X.XXX,XX
    Pedágio ....................  R$ X.XXX,XX
    Seguro .....................  R$ X.XXX,XX
                                  ──────────
= LUCRO BRUTO ..................  R$ X.XXX,XX

(-) DESPESAS ADMINISTRATIVAS
    Administrativo .............  R$ X.XXX,XX

(-) DESPESAS FINANCEIRAS
    Financeiro .................  R$ X.XXX,XX
                                  ──────────
= RESULTADO LÍQUIDO ............  R$ X.XXX,XX
```

Resultado positivo em verde, negativo em vermelho.
Botão de exportar como PDF.

**Regra crítica:** Usar SEMPRE o campo `competencia` para agrupar, nunca `data_vencimento` ou `data_pagamento`.

---

### 9. HISTÓRICO & RELATÓRIOS (`/historico`)

Filtros combinados:
- Tipo: Receitas | Despesas | Ambos
- Status: Previsto | Pago/Recebido | Cancelado | Todos
- Período: data início / data fim
- Categoria (para despesas)
- Conta bancária

Resultado em tabela com paginação.
Botão exportar como PDF ou Excel (.xlsx).

---

### 10. SCORE FINANCEIRO (`/score`)

Calcular score de 0 a 100 em tempo real com base nas seguintes regras:

**Penalidades:**
- Cada conta a pagar vencida e não paga: -5 pontos
- Saldo atual negativo: -25 pontos
- Saldo projetado negativo: -20 pontos
- Índice de endividamento > 80% da receita mensal: -15 pontos

**Bônus:**
- Cada pagamento realizado no prazo (data_pagamento <= data_vencimento): +2 pontos
- Score máximo: 100

**Classificação:**
- 80–100 → Saudável (verde)
- 50–79 → Atenção (amarelo/âmbar)
- 0–49 → Crítico (vermelho)

**Exibição:**
- Gauge visual circular com a nota no centro
- Cor dinâmica conforme faixa
- Cards explicando cada critério e seu impacto atual
- Botão "Ver Detalhes" mostrando breakdown completo

---

## AUTENTICAÇÃO

Usar Supabase Auth com email/senha.
Página de login (`/login`) com redirecionamento para `/dashboard` após autenticação.
Proteger todas as rotas com middleware Next.js verificando sessão ativa.

---

## REGRAS DE NEGÓCIO INVIOLÁVEIS

1. **Saldo real** só muda quando status = `'pago'` ou `'recebido'` — nunca em `'previsto'`
2. **DRE** usa sempre o campo `competencia` — nunca `data_vencimento` ou `data_pagamento`
3. **Fluxo de Caixa** usa `data_vencimento` para projeções futuras
4. **Nunca excluir** lançamentos — apenas cancelar (soft delete via status='cancelado')
5. **Saldo é calculado via query** (SELECT SUM) — nunca armazenado em campo fixo
6. **Score é calculado em tempo real** — nunca cacheado em banco
7. **Contas bancárias** com lançamentos vinculados não podem ser excluídas, apenas desativadas

---

## PADRÕES DE UI/UX

- Tema: claro (light mode), cores primárias em azul (#2B6CB0)
- Valores monetários: sempre formatados em R$ com 2 casas decimais e separador de milhar
- Datas: formato brasileiro (DD/MM/YYYY)
- Feedback visual em todas as ações: toast de sucesso/erro após salvar, confirmar ou cancelar
- Loading skeleton nas listagens enquanto carrega dados
- Tabelas com zebra striping (linhas alternadas) para legibilidade
- Modais ou drawers para formulários (nunca páginas separadas para CRUD simples)
- Confirmar ações destrutivas (cancelar lançamento) com dialog de confirmação

---

## SEED DATA (opcional — para testar)

Inserir dados de exemplo ao inicializar:
- 2 contas bancárias (Conta Corrente Bradesco com saldo inicial R$15.000, Caixa com R$2.000)
- 3 clientes (Transportadora Alpha, Logística Beta, Fretes Gamma)
- Categorias padrão conforme listadas acima
- 5 contas a receber variadas (mix de previstas e recebidas)
- 8 contas a pagar variadas (mix de previstas e pagas, incluindo 2 vencidas)