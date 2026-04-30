import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, isDatePast } from '../utils/formatters';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, Check, Pencil, Filter, Inbox, CreditCard, Layers, ChevronDown, ChevronRight, FileDown, Trash2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ContaPagar, StatusDespesa } from '../types';
import { cn } from '../components/ui/utils';
import { gerarVoucherPagamento } from '../utils/pdfGenerator';

export function ContasPagar() {
  const {
    contasPagar,
    categorias,
    contasBancarias,
    addContaPagar,
    addContasPagarParceladas,
    addCustoFixo,
    updateContaPagar,
    confirmarPagamento,
    deleteContaPagar,
  } = useApp();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
      deleteContaPagar(id);
      toast.success('Conta excluída com sucesso!');
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
  const [selectedContaBancaria, setSelectedContaBancaria] = useState('');

  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusDespesa | 'todos'>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');

  // Grupos de parcelamento expandidos
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Helpers
  const getCategoriaName = (catId: string) =>
    categorias.find(c => c.id === catId)?.nome || 'Sem categoria';
  const getContaBancariaName = (id?: string) =>
    id ? (contasBancarias.find(c => c.id === id)?.nome || id) : undefined;

  const handleVoucherPagamento = (conta: ContaPagar) => {
    gerarVoucherPagamento({
      id: conta.id,
      fornecedor: conta.fornecedor,
      descricao: conta.descricao,
      valor: conta.valor,
      data_pagamento: conta.data_pagamento || new Date().toISOString().split('T')[0],
      data_vencimento: conta.data_vencimento,
      categoria: getCategoriaName(conta.categoria_id),
      conta_bancaria: getContaBancariaName(conta.conta_bancaria_id),
      parcela_atual: conta.parcela_atual,
      total_parcelas: conta.total_parcelas,
    });
    toast.success('Comprovante gerado!');
  };

  // Modo parcelado e Custo Fixo
  const [isParcelado, setIsParcelado] = useState(false);
  const [isCustoFixo, setIsCustoFixo] = useState(false);
  const [numParcelas, setNumParcelas] = useState(2);

  // Form state
  const [formData, setFormData] = useState({
    fornecedor: '',
    categoria_id: '',
    descricao: '',
    valor: '',
    data_vencimento: '',
    competencia: '',
    status: 'previsto' as StatusDespesa,
    conta_bancaria_id: '',
  });

  const resetForm = () => {
    setFormData({
      fornecedor: '',
      categoria_id: '',
      descricao: '',
      valor: '',
      data_vencimento: '',
      competencia: '',
      status: 'previsto',
      conta_bancaria_id: '',
    });
    setIsParcelado(false);
    setIsCustoFixo(false);
    setNumParcelas(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fornecedor || !formData.categoria_id || !formData.valor || !formData.data_vencimento || !formData.competencia) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const base = {
      fornecedor: formData.fornecedor,
      categoria_id: formData.categoria_id,
      descricao: formData.descricao || undefined,
      valor: parseFloat(formData.valor),
      data_vencimento: formData.data_vencimento,
      competencia: formData.competencia,
      status: formData.status,
      conta_bancaria_id: formData.conta_bancaria_id || undefined,
      data_pagamento: formData.status === 'pago' ? new Date().toISOString().split('T')[0] : undefined,
    };

    if (selectedConta) {
      updateContaPagar(selectedConta.id, base);
      toast.success('Conta atualizada com sucesso!');
    } else if (isCustoFixo) {
      addCustoFixo(base);
      toast.success('Custo Fixo configurado com sucesso! 🎉', {
        description: `${formData.fornecedor} — ${formatCurrency(parseFloat(formData.valor))} recorrente.`,
      });
    } else if (isParcelado && numParcelas > 1) {
      addContasPagarParceladas(base, numParcelas);
      toast.success(`${numParcelas} parcelas criadas com sucesso! 🎉`, {
        description: `${formData.fornecedor} — ${formatCurrency(parseFloat(formData.valor))} x ${numParcelas}x`,
      });
    } else {
      addContaPagar(base);
      toast.success('Conta criada com sucesso!');
    }

    setDialogOpen(false);
    setSelectedConta(null);
    resetForm();
  };

  const handleEdit = (conta: ContaPagar) => {
    setSelectedConta(conta);
    setIsParcelado(false);
    setIsCustoFixo(false);
    setFormData({
      fornecedor: conta.fornecedor,
      categoria_id: conta.categoria_id,
      descricao: conta.descricao || '',
      valor: conta.valor.toString(),
      data_vencimento: conta.data_vencimento,
      competencia: conta.competencia,
      status: conta.status,
      conta_bancaria_id: conta.conta_bancaria_id || '',
    });
    setDialogOpen(true);
  };

  const handleConfirmarPagamento = (conta: ContaPagar) => {
    setSelectedConta(conta);
    setSelectedContaBancaria('');
    setConfirmDialogOpen(true);
  };

  const confirmarPagamentoAction = () => {
    if (!selectedConta || !selectedContaBancaria) {
      toast.error('Selecione uma conta bancária');
      return;
    }
    confirmarPagamento(selectedConta.id, selectedContaBancaria);
    toast.success('Pagamento confirmado com sucesso!');
    setConfirmDialogOpen(false);
    setSelectedConta(null);
    setSelectedContaBancaria('');
  };

  const toggleGroup = (grupoId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(grupoId)) next.delete(grupoId);
      else next.add(grupoId);
      return next;
    });
  };

  // Filtrar contas
  const contasFiltradas = contasPagar.filter(conta => {
    if (statusFilter !== 'todos' && conta.status !== statusFilter) return false;
    if (categoriaFilter !== 'todos' && conta.categoria_id !== categoriaFilter) return false;
    return true;
  });

  // Agrupar: separar parceladas (por grupo) das avulsas
  const { linhas } = useMemo(() => {
    type Linha =
      | { tipo: 'avulsa'; conta: ContaPagar }
      | { tipo: 'grupo_header'; grupoId: string; parcelas: ContaPagar[]; expanded: boolean }
      | { tipo: 'grupo_parcela'; conta: ContaPagar; grupoId: string };

    const grupos = new Map<string, ContaPagar[]>();
    const avulsas: ContaPagar[] = [];

    contasFiltradas.forEach(c => {
      if (c.grupo_parcelamento) {
        const g = grupos.get(c.grupo_parcelamento) || [];
        g.push(c);
        grupos.set(c.grupo_parcelamento, g);
      } else {
        avulsas.push(c);
      }
    });

    const linhas: Linha[] = [];

    // Grupos primeiro (ordenados pela 1ª parcela)
    grupos.forEach((parcelas, grupoId) => {
      const sorted = [...parcelas].sort((a, b) => (a.parcela_atual || 0) - (b.parcela_atual || 0));
      const isExpanded = expandedGroups.has(grupoId);
      linhas.push({ tipo: 'grupo_header', grupoId, parcelas: sorted, expanded: isExpanded });
      if (isExpanded) {
        sorted.forEach(c => linhas.push({ tipo: 'grupo_parcela', conta: c, grupoId }));
      }
    });

    // Avulsas
    avulsas.forEach(c => linhas.push({ tipo: 'avulsa', conta: c }));

    return { linhas };
  }, [contasFiltradas, expandedGroups]);

  const getStatusBadge = (status: StatusDespesa) => {
    const variants = {
      previsto: { label: 'Previsto', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      pago: { label: 'Pago', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      cancelado: { label: 'Cancelado', className: 'bg-muted text-muted-foreground border-border/40' },
    };
    const config = variants[status];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getCategoriaNome = (categoriaId: string) =>
    categorias.find(c => c.id === categoriaId)?.nome || '—';

  // Valores do preview de parcelamento
  const valorParcela = formData.valor && numParcelas > 1
    ? parseFloat(formData.valor) / numParcelas
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Contas a Pagar
          </h1>
          <p className="text-foreground/70 mt-1">Gerencie suas despesas</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setSelectedConta(null); resetForm(); }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Pagar
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedConta ? 'Editar' : 'Nova'} Conta a Pagar
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da conta a pagar
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">Fornecedor *</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                    placeholder="Nome do fornecedor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.filter(c => c.ativo).map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">
                    {isParcelado ? 'Valor Total (R$) *' : 'Valor (R$) *'}
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">
                    {isParcelado ? '1ª Parcela — Vencimento *' : 'Data de Vencimento *'}
                  </Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competencia">Competência (Mês/Ano) *</Label>
                  <Input
                    id="competencia"
                    type="month"
                    value={formData.competencia}
                    onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
                  />
                </div>

                {!selectedConta && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: StatusDespesa) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="previsto">Previsto</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.status === 'pago' && (
                  <div className="space-y-2">
                    <Label htmlFor="conta_bancaria">Conta Bancária</Label>
                    <Select
                      value={formData.conta_bancaria_id}
                      onValueChange={(value) => setFormData({ ...formData, conta_bancaria_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {contasBancarias.filter(c => c.ativo).map(conta => (
                          <SelectItem key={conta.id} value={conta.id}>
                            {conta.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Detalhes da conta a pagar..."
                  rows={2}
                />
              </div>

              {/* ======== SEÇÃO DE PARCELAMENTO / CUSTO FIXO ======== */}
              {!selectedConta && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CUSTO FIXO */}
                  <div className="border border-border/40 rounded-xl overflow-hidden self-start">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustoFixo(!isCustoFixo);
                        if (!isCustoFixo) setIsParcelado(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all',
                        isCustoFixo
                          ? 'bg-purple-500/10 text-purple-400 border-b border-purple-500/20'
                          : 'bg-muted/30 text-foreground/70 hover:bg-muted/50'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Custo Fixo
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border font-semibold',
                        isCustoFixo
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : 'bg-muted text-muted-foreground border-border/40'
                      )}>
                        {isCustoFixo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </button>
                    {isCustoFixo && (
                      <div className="px-4 py-3 text-xs text-foreground/60 bg-purple-500/5">
                        Esta despesa será replicada automaticamente para os próximos meses (5 anos) mantendo o mesmo valor e vencimento.
                      </div>
                    )}
                  </div>

                  {/* PARCELAMENTO */}
                  <div className={cn("border border-border/40 rounded-xl overflow-hidden self-start", isCustoFixo && "opacity-50 pointer-events-none")}>
                    <button
                      type="button"
                      disabled={isCustoFixo}
                      onClick={() => setIsParcelado(!isParcelado)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all',
                        isParcelado
                          ? 'bg-blue-500/10 text-blue-400 border-b border-blue-500/20'
                          : 'bg-muted/30 text-foreground/70 hover:bg-muted/50'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Parcelar compra
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full border font-semibold',
                        isParcelado
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-muted text-muted-foreground border-border/40'
                      )}>
                        {isParcelado ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </button>

                  {isParcelado && (
                    <div className="px-4 py-4 space-y-4 bg-blue-500/5">
                      <div className="space-y-2">
                        <Label>Número de Parcelas</Label>
                        <div className="flex flex-wrap gap-2">
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setNumParcelas(n)}
                              className={cn(
                                'w-10 h-10 rounded-lg text-sm font-semibold border transition-all',
                                numParcelas === n
                                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30'
                                  : 'border-border/40 text-foreground/70 hover:border-blue-500/50 hover:text-blue-400'
                              )}
                            >
                              {n}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preview das parcelas */}
                      {valorParcela !== null && formData.data_vencimento && (
                        <div className="bg-card/60 border border-border/40 rounded-lg p-3 space-y-2">
                          <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide">
                            Preview das parcelas
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                            {Array.from({ length: numParcelas }, (_, i) => {
                              const data = new Date(formData.data_vencimento + 'T12:00:00Z');
                              data.setMonth(data.getMonth() + i);
                              return (
                                <div
                                  key={i}
                                  className="flex items-center justify-between bg-muted/30 rounded-md px-2.5 py-1.5 text-xs"
                                >
                                  <span className="text-foreground/60">
                                    Parcela {i + 1}/{numParcelas}
                                  </span>
                                  <div className="text-right">
                                    <span className="text-blue-400 font-semibold">
                                      {formatCurrency(valorParcela)}
                                    </span>
                                    <span className="block text-foreground/40 text-[10px]">
                                      {data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between pt-1 border-t border-border/30 text-xs">
                            <span className="text-foreground/50">Total</span>
                            <span className="text-foreground font-bold">
                              {formatCurrency(parseFloat(formData.valor))}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>
              )}
              {/* ======================================= */}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setDialogOpen(false); setSelectedConta(null); resetForm(); }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  {selectedConta
                    ? 'Atualizar'
                    : isParcelado
                    ? `Criar ${numParcelas} parcelas`
                    : 'Criar conta'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="previsto">Previsto</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-foreground/70">Fornecedor</TableHead>
                  <TableHead className="text-foreground/70">Categoria</TableHead>
                  <TableHead className="text-foreground/70">Valor</TableHead>
                  <TableHead className="text-foreground/70">Vencimento</TableHead>
                  <TableHead className="text-foreground/70">Competência</TableHead>
                  <TableHead className="text-foreground/70">Status</TableHead>
                  <TableHead className="text-right text-foreground/70">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-inner ring-4 ring-background">
                          <Inbox className="w-10 h-10 text-primary opacity-80" />
                        </div>
                        <div>
                          <p className="text-xl font-medium text-foreground">Nenhuma conta encontrada</p>
                          <p className="text-sm text-foreground/50 max-w-sm mx-auto mt-2">
                            Não encontramos despesas correspondentes a esta busca. Clique no botão azul acima para registrar seu primeiro pagamento!
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  linhas.map((linha, idx) => {
                    // ---- GRUPO HEADER ----
                    if (linha.tipo === 'grupo_header') {
                      const { grupoId, parcelas, expanded } = linha;
                      const totalPago = parcelas.filter(p => p.status === 'pago').length;
                      const totalParcelas = parcelas[0]?.total_parcelas || parcelas.length;
                      const valorParcela = parcelas[0]?.valor || 0;
                      const fornecedor = parcelas[0]?.fornecedor || '—';
                      const catId = parcelas[0]?.categoria_id || '';
                      const isFixedCost = parcelas[0]?.is_fixed_cost === true;
                      const algumVencido = parcelas.some(p => p.status === 'previsto' && isDatePast(p.data_vencimento));
                      const proximaParcela = parcelas.find(p => p.status === 'previsto');

                      return (
                        <TableRow
                          key={`grupo-${grupoId}`}
                          className={cn(
                            'border-border/40 cursor-pointer select-none transition-colors',
                            algumVencido ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-blue-500/5'
                          )}
                          onClick={() => toggleGroup(grupoId)}
                        >
                          <TableCell className="font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              {expanded ? (
                                <ChevronDown className="h-4 w-4 text-blue-400 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0" />
                              )}
                              <span>{fornecedor}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground/80">
                            {getCategoriaNome(catId)}
                          </TableCell>
                          <TableCell className="font-semibold text-red-400">
                            {formatCurrency(valorParcela)}
                            <span className="text-foreground/40 text-xs ml-1">/ parcela</span>
                          </TableCell>
                          <TableCell className="text-foreground/80">
                            {proximaParcela ? formatDate(proximaParcela.data_vencimento) : '—'}
                          </TableCell>
                          <TableCell>
                            {isFixedCost ? (
                              <Badge
                                variant="outline"
                                className="gap-1 items-center border-purple-500/30 text-purple-400 bg-purple-500/10"
                              >
                                <RefreshCcw className="h-3 w-3" />
                                Custo Fixo
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 items-center border-blue-500/30 text-blue-400 bg-blue-500/10"
                              >
                                <Layers className="h-3 w-3" />
                                {totalPago}/{totalParcelas} pagas
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {algumVencido ? (
                              <Badge variant="destructive" className="text-xs">Parcela vencida</Badge>
                            ) : totalPago === totalParcelas ? (
                              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">Quitado</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Em aberto</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs text-foreground/40">
                              {expanded ? 'Recolher' : 'Expandir'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    // ---- PARCELA INDIVIDUAL (dentro do grupo expandido) ----
                    if (linha.tipo === 'grupo_parcela') {
                      const { conta } = linha;
                      return (
                        <TableRow
                          key={conta.id}
                          className={cn(
                            'border-border/20 bg-muted/10',
                            conta.status === 'previsto' && isDatePast(conta.data_vencimento)
                              ? 'bg-red-500/10 hover:bg-red-500/15'
                              : 'hover:bg-muted/20'
                          )}
                        >
                          <TableCell className="pl-10 text-foreground/70 text-sm">
                            {conta.is_fixed_cost ? (
                              <span className="inline-flex items-center gap-1.5">
                                <RefreshCcw className="h-3 w-3 text-purple-400" />
                                Custo Fixo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                  {conta.parcela_atual}
                                </span>
                                Parcela {conta.parcela_atual}/{conta.total_parcelas}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-foreground/60 text-sm">
                            {getCategoriaNome(conta.categoria_id)}
                          </TableCell>
                          <TableCell className="font-semibold text-red-400 text-sm">
                            {formatCurrency(conta.valor)}
                          </TableCell>
                          <TableCell className="text-foreground/70 text-sm">
                            {formatDate(conta.data_vencimento)}
                            {conta.status === 'previsto' && isDatePast(conta.data_vencimento) && (
                              <Badge variant="destructive" className="ml-2 text-xs">Vencido</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-foreground/60 text-sm">
                            {conta.competencia.split('-').reverse().join('/')}
                          </TableCell>
                          <TableCell>{getStatusBadge(conta.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {conta.status === 'previsto' && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700 h-7 text-xs shadow-md"
                                  onClick={(e) => { e.stopPropagation(); handleConfirmarPagamento(conta); }}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Pagar
                                </Button>
                              )}
                              {conta.status === 'pago' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500/40 text-green-400 hover:bg-green-500/10 h-7 text-xs gap-1"
                                  onClick={(e) => { e.stopPropagation(); handleVoucherPagamento(conta); }}
                                >
                                  <FileDown className="h-3 w-3" />
                                  Comprovante
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border/40 h-7 w-7 p-0"
                                onClick={(e) => { e.stopPropagation(); handleEdit(conta); }}
                                title="Editar"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/40 text-red-400 hover:bg-red-500/10 h-7 w-7 p-0"
                                onClick={(e) => handleDelete(conta.id, e)}
                                title="Excluir"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    // ---- CONTA AVULSA ----
                    const { conta } = linha as { tipo: 'avulsa'; conta: ContaPagar };
                    return (
                      <TableRow
                        key={conta.id}
                        className={
                          conta.status === 'previsto' && isDatePast(conta.data_vencimento)
                            ? 'bg-red-500/10 border-border/40 hover:bg-red-500/15'
                            : 'border-border/40 hover:bg-muted/30'
                        }
                      >
                        <TableCell className="font-medium text-foreground">
                          {conta.fornecedor}
                        </TableCell>
                        <TableCell className="text-foreground/80">
                          {getCategoriaNome(conta.categoria_id)}
                        </TableCell>
                        <TableCell className="font-semibold text-red-400">
                          {formatCurrency(conta.valor)}
                        </TableCell>
                        <TableCell className="text-foreground/80">
                          {formatDate(conta.data_vencimento)}
                          {conta.status === 'previsto' && isDatePast(conta.data_vencimento) && (
                            <Badge variant="destructive" className="ml-2 text-xs">Vencido</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground/80">
                          {conta.competencia.split('-').reverse().join('/')}
                        </TableCell>
                        <TableCell>{getStatusBadge(conta.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {conta.status === 'previsto' && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 shadow-md"
                                onClick={() => handleConfirmarPagamento(conta)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            {conta.status === 'pago' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/40 text-green-400 hover:bg-green-500/10 gap-1"
                                onClick={() => handleVoucherPagamento(conta)}
                              >
                                <FileDown className="h-4 w-4" />
                                Comprovante
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border/40 h-8 w-8 p-0 ml-1"
                              onClick={(e) => { e.stopPropagation(); handleEdit(conta); }}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4 text-foreground/70" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/40 text-red-500 hover:bg-red-500/10 h-8 w-8 p-0 ml-1"
                              onClick={(e) => { e.stopPropagation(); deleteContaPagar(conta.id); }}
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Confirmar Pagamento */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              Selecione a conta bancária para registro do pagamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Conta Bancária *</Label>
              <Select value={selectedContaBancaria} onValueChange={setSelectedContaBancaria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {contasBancarias.filter(c => c.ativo).map(conta => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedConta && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border/40 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Fornecedor</span>
                  <span className="font-medium text-foreground">{selectedConta.fornecedor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Valor</span>
                  <span className="font-semibold text-red-400">{formatCurrency(selectedConta.valor)}</span>
                </div>
                {selectedConta.parcela_atual && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Parcela</span>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs">
                      {selectedConta.parcela_atual}/{selectedConta.total_parcelas}
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Vencimento</span>
                  <span className="text-foreground">{formatDate(selectedConta.data_vencimento)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmarPagamentoAction}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}