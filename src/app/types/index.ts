export type StatusReceita = 'previsto' | 'recebido' | 'cancelado';
export type StatusDespesa = 'previsto' | 'pago' | 'cancelado';
export type TipoConta = 'conta_corrente' | 'caixa' | 'carteira_digital';
export type TipoCategoria = 'operacional' | 'administrativo' | 'financeiro';

export interface ContaBancaria {
  id: string;
  nome: string;
  tipo: TipoConta;
  saldo_inicial: number;
  ativo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  created_at: string;
}

export interface CategoriaCusto {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  cor: string;
  ativo: boolean;
  created_at: string;
}

export interface ContaReceber {
  id: string;
  cliente_id: string;
  descricao?: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: StatusReceita;
  conta_bancaria_id?: string;
  competencia: string; // YYYY-MM
  created_at: string;
}

export interface ContaPagar {
  id: string;
  fornecedor: string;
  categoria_id: string;
  descricao?: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: StatusDespesa;
  conta_bancaria_id?: string;
  competencia: string; // YYYY-MM
  created_at: string;
}
