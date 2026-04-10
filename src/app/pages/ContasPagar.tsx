import { useState } from 'react';
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
import { Plus, Check, Pencil, Filter, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { ContaPagar, StatusDespesa } from '../types';

export function ContasPagar() {
  const {
    contasPagar,
    categorias,
    contasBancarias,
    addContaPagar,
    updateContaPagar,
    confirmarPagamento,
  } = useApp();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
  const [selectedContaBancaria, setSelectedContaBancaria] = useState('');

  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusDespesa | 'todos'>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fornecedor || !formData.categoria_id || !formData.valor || !formData.data_vencimento || !formData.competencia) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const data = {
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
      updateContaPagar(selectedConta.id, data);
      toast.success('Conta atualizada com sucesso!');
    } else {
      addContaPagar(data);
      toast.success('Conta criada com sucesso!');
    }

    setDialogOpen(false);
    setSelectedConta(null);
    resetForm();
  };

  const handleEdit = (conta: ContaPagar) => {
    setSelectedConta(conta);
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

  // Filtrar contas
  const contasFiltradas = contasPagar.filter(conta => {
    if (statusFilter !== 'todos' && conta.status !== statusFilter) return false;
    if (categoriaFilter !== 'todos' && conta.categoria_id !== categoriaFilter) return false;
    return true;
  });

  const getStatusBadge = (status: StatusDespesa) => {
    const variants = {
      previsto: { variant: 'default' as const, label: 'Previsto', className: 'bg-blue-500 hover:bg-blue-600' },
      pago: { variant: 'default' as const, label: 'Pago', className: 'bg-green-500 hover:bg-green-600' },
      cancelado: { variant: 'secondary' as const, label: 'Cancelado', className: '' },
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getCategoriaNome = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId)?.nome || 'Categoria não encontrada';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Contas a Pagar</h1>
          <p className="text-foreground/70 mt-1">Gerencie suas despesas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedConta(null);
            resetForm();
          }
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
                  <Label htmlFor="valor">Valor (R$) *</Label>
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
                  <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
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
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedConta(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90">
                  {selectedConta ? 'Atualizar' : 'Criar'}
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
                {contasFiltradas.length === 0 ? (
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
                  contasFiltradas.map((conta) => (
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
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Vencido
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {conta.competencia.split('-').reverse().join('/')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(conta.status)}
                      </TableCell>
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border/40"
                            onClick={() => handleEdit(conta)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
              <div className="p-4 bg-muted/30 rounded-lg border border-border/40 space-y-1">
                <p className="text-sm text-foreground"><strong>Fornecedor:</strong> {selectedConta.fornecedor}</p>
                <p className="text-sm text-foreground"><strong>Valor:</strong> {formatCurrency(selectedConta.valor)}</p>
                <p className="text-sm text-foreground"><strong>Vencimento:</strong> {formatDate(selectedConta.data_vencimento)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmarPagamentoAction}
            >
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}