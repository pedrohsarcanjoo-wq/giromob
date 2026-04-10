import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Filter, FileDown } from 'lucide-react';
import { toast } from 'sonner';

type TipoTransacao = 'receitas' | 'despesas' | 'ambos';

export function Historico() {
  const { contasReceber, contasPagar, clientes, categorias, contasBancarias } = useApp();

  const [tipoFilter, setTipoFilter] = useState<TipoTransacao>('ambos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [contaBancariaFilter, setContaBancariaFilter] = useState('todos');

  // Combinar receitas e despesas
  const transacoes = [
    ...contasReceber.map(c => ({
      id: c.id,
      tipo: 'receita' as const,
      data: c.data_recebimento || c.data_vencimento,
      descricao: c.descricao || `Frete - ${clientes.find(cl => cl.id === c.cliente_id)?.nome || 'Cliente'}`,
      valor: c.valor,
      status: c.status,
      categoria: 'Receita',
      conta_bancaria_id: c.conta_bancaria_id,
    })),
    ...contasPagar.map(c => ({
      id: c.id,
      tipo: 'despesa' as const,
      data: c.data_pagamento || c.data_vencimento,
      descricao: c.descricao || c.fornecedor,
      valor: c.valor,
      status: c.status,
      categoria: categorias.find(cat => cat.id === c.categoria_id)?.nome || 'Sem categoria',
      conta_bancaria_id: c.conta_bancaria_id,
    })),
  ];

  // Filtrar transações
  const transacoesFiltradas = transacoes.filter(t => {
    if (tipoFilter !== 'ambos' && ((tipoFilter === 'receitas' && t.tipo !== 'receita') || (tipoFilter === 'despesas' && t.tipo !== 'despesa'))) {
      return false;
    }
    
    if (statusFilter !== 'todos') {
      if (statusFilter === 'pago_recebido' && !['pago', 'recebido'].includes(t.status)) return false;
      if (statusFilter !== 'pago_recebido' && t.status !== statusFilter) return false;
    }

    if (dataInicio && t.data < dataInicio) return false;
    if (dataFim && t.data > dataFim) return false;

    if (categoriaFilter !== 'todos' && t.tipo === 'despesa') {
      const despesa = contasPagar.find(cp => cp.id === t.id);
      if (!despesa || despesa.categoria_id !== categoriaFilter) return false;
    }

    if (contaBancariaFilter !== 'todos' && t.conta_bancaria_id !== contaBancariaFilter) return false;

    return true;
  });

  // Ordenar por data (mais recente primeiro)
  transacoesFiltradas.sort((a, b) => b.data.localeCompare(a.data));

  const getStatusBadge = (tipo: 'receita' | 'despesa', status: string) => {
    if (status === 'previsto') {
      return <Badge className="bg-blue-500">Previsto</Badge>;
    }
    if (status === 'recebido' || status === 'pago') {
      return <Badge className="bg-green-500">{tipo === 'receita' ? 'Recebido' : 'Pago'}</Badge>;
    }
    if (status === 'cancelado') {
      return <Badge variant="secondary">Cancelado</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const getContaBancariaNome = (id?: string) => {
    if (!id) return '-';
    return contasBancarias.find(c => c.id === id)?.nome || '-';
  };

  const handleExport = () => {
    toast.success('Função de exportação em desenvolvimento');
    // Aqui seria implementada a lógica de exportação
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Histórico & Relatórios</h1>
          <p className="text-foreground/70 mt-1">Consulte todas as transações</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="border-border/40">
          <FileDown className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Filter className="h-4 w-4 text-blue-400" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipoFilter} onValueChange={(value: TipoTransacao) => setTipoFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambos">Receitas e Despesas</SelectItem>
                  <SelectItem value="receitas">Apenas Receitas</SelectItem>
                  <SelectItem value="despesas">Apenas Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="previsto">Previsto</SelectItem>
                  <SelectItem value="pago_recebido">Pago/Recebido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            {(tipoFilter === 'despesas' || tipoFilter === 'ambos') && (
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Conta Bancária</Label>
              <Select value={contaBancariaFilter} onValueChange={setContaBancariaFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {contasBancarias.map(conta => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Total de Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-2xl font-bold text-foreground">{transacoesFiltradas.length}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Total de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(
                transacoesFiltradas
                  .filter(t => t.tipo === 'receita')
                  .reduce((sum, t) => sum + t.valor, 0)
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-red-500/20 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Total de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(
                transacoesFiltradas
                  .filter(t => t.tipo === 'despesa')
                  .reduce((sum, t) => sum + t.valor, 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-foreground/70">Data</TableHead>
                  <TableHead className="text-foreground/70">Tipo</TableHead>
                  <TableHead className="text-foreground/70">Descrição</TableHead>
                  <TableHead className="text-foreground/70">Categoria</TableHead>
                  <TableHead className="text-foreground/70">Valor</TableHead>
                  <TableHead className="text-foreground/70">Status</TableHead>
                  <TableHead className="text-foreground/70">Conta Bancária</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-foreground/50 py-8">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  transacoesFiltradas.map((transacao) => (
                    <TableRow key={`${transacao.tipo}-${transacao.id}`} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="text-foreground">
                        {formatDate(transacao.data)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transacao.tipo === 'receita' ? 'default' : 'destructive'} className={transacao.tipo === 'receita' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-foreground">
                        {transacao.descricao}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {transacao.categoria}
                      </TableCell>
                      <TableCell className={`font-semibold ${transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                        {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transacao.tipo, transacao.status)}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {getContaBancariaNome(transacao.conta_bancaria_id)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}