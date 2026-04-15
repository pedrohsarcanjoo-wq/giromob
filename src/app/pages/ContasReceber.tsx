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
import { Plus, Check, Pencil, Filter, Inbox, FileDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ContaReceber, StatusReceita } from '../types';
import { gerarVoucherFatura } from '../utils/pdfGenerator';

export function ContasReceber() {
  const { 
    contasReceber, 
    clientes, 
    contasBancarias,
    addContaReceber, 
    addContaReceber, 
    updateContaReceber,
    confirmarRecebimento,
    deleteContaReceber,
  } = useApp();

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
      deleteContaReceber(id);
      toast.success('Conta excluída com sucesso!');
    }
  };

  const getClienteNome = (clienteId: string) =>
    clientes.find(c => c.id === clienteId)?.nome || 'Cliente não encontrado';

  const getContaBancariaName = (id?: string) =>
    id ? (contasBancarias.find(c => c.id === id)?.nome || id) : undefined;

  const handleVoucherFatura = (conta: ContaReceber) => {
    gerarVoucherFatura({
      id: conta.id,
      cliente: getClienteNome(conta.cliente_id),
      descricao: conta.descricao,
      valor: conta.valor,
      data_vencimento: conta.data_vencimento,
      data_recebimento: conta.data_recebimento,
      status: conta.status,
      conta_bancaria: getContaBancariaName(conta.conta_bancaria_id),
      competencia: conta.competencia,
    });
    toast.success('Fatura gerada com sucesso!');
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);
  const [selectedContaBancaria, setSelectedContaBancaria] = useState('');
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusReceita | 'todos'>('todos');
  const [clienteFilter, setClienteFilter] = useState('todos');

  // Form state
  const [formData, setFormData] = useState({
    cliente_id: '',
    descricao: '',
    valor: '',
    data_vencimento: '',
    competencia: '',
    status: 'previsto' as StatusReceita,
    conta_bancaria_id: '',
  });

  const resetForm = () => {
    setFormData({
      cliente_id: '',
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
    
    if (!formData.cliente_id || !formData.valor || !formData.data_vencimento || !formData.competencia) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const data = {
      cliente_id: formData.cliente_id,
      descricao: formData.descricao || undefined,
      valor: parseFloat(formData.valor),
      data_vencimento: formData.data_vencimento,
      competencia: formData.competencia,
      status: formData.status,
      conta_bancaria_id: formData.conta_bancaria_id || undefined,
      data_recebimento: formData.status === 'recebido' ? new Date().toISOString().split('T')[0] : undefined,
    };

    if (selectedConta) {
      updateContaReceber(selectedConta.id, data);
      toast.success('Conta atualizada com sucesso!');
    } else {
      addContaReceber(data);
      toast.success('Conta criada com sucesso!');
    }

    setDialogOpen(false);
    setSelectedConta(null);
    resetForm();
  };

  const handleEdit = (conta: ContaReceber) => {
    setSelectedConta(conta);
    setFormData({
      cliente_id: conta.cliente_id,
      descricao: conta.descricao || '',
      valor: conta.valor.toString(),
      data_vencimento: conta.data_vencimento,
      competencia: conta.competencia,
      status: conta.status,
      conta_bancaria_id: conta.conta_bancaria_id || '',
    });
    setDialogOpen(true);
  };

  const handleConfirmarRecebimento = (conta: ContaReceber) => {
    setSelectedConta(conta);
    setSelectedContaBancaria('');
    setConfirmDialogOpen(true);
  };

  const confirmarRecebimentoAction = () => {
    if (!selectedConta || !selectedContaBancaria) {
      toast.error('Selecione uma conta bancária');
      return;
    }

    confirmarRecebimento(selectedConta.id, selectedContaBancaria);
    toast.success('Recebimento confirmado com sucesso!');
    setConfirmDialogOpen(false);
    setSelectedConta(null);
    setSelectedContaBancaria('');
  };

  // Filtrar contas
  const contasFiltradas = contasReceber.filter(conta => {
    if (statusFilter !== 'todos' && conta.status !== statusFilter) return false;
    if (clienteFilter !== 'todos' && conta.cliente_id !== clienteFilter) return false;
    return true;
  });

  const getStatusBadge = (status: StatusReceita) => {
    const variants = {
      previsto: { variant: 'default' as const, label: 'Previsto', className: 'bg-blue-500 hover:bg-blue-600' },
      recebido: { variant: 'default' as const, label: 'Recebido', className: 'bg-green-500 hover:bg-green-600' },
      cancelado: { variant: 'secondary' as const, label: 'Cancelado', className: '' },
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Contas a Receber</h1>
          <p className="text-foreground/70 mt-1">Gerencie suas receitas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedConta(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Receber
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedConta ? 'Editar' : 'Nova'} Conta a Receber
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da conta a receber
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente *</Label>
                  <Select 
                    value={formData.cliente_id} 
                    onValueChange={(value) => setFormData({...formData, cliente_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.filter(c => c.ativo).map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
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
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competencia">Competência (Mês/Ano) *</Label>
                  <Input
                    id="competencia"
                    type="month"
                    value={formData.competencia}
                    onChange={(e) => setFormData({...formData, competencia: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: StatusReceita) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="previsto">Previsto</SelectItem>
                      <SelectItem value="recebido">Recebido</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === 'recebido' && (
                  <div className="space-y-2">
                    <Label htmlFor="conta_bancaria">Conta Bancária</Label>
                    <Select 
                      value={formData.conta_bancaria_id} 
                      onValueChange={(value) => setFormData({...formData, conta_bancaria_id: value})}
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
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Detalhes da conta a receber..."
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
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
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
                  <SelectItem value="recebido">Recebido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteFilter} onValueChange={setClienteFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
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
                  <TableHead className="text-foreground/70">Cliente</TableHead>
                  <TableHead className="text-foreground/70">Descrição</TableHead>
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
                            Não encontramos receitas correspondentes a esta busca. Clique no botão azul acima para registrar seu primeiro recebimento!
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
                          ? 'bg-orange-50'
                          : ''
                      }
                    >
                      <TableCell className="font-medium">
                        {getClienteNome(conta.cliente_id)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {conta.descricao || '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(conta.valor)}
                      </TableCell>
                      <TableCell>
                        {formatDate(conta.data_vencimento)}
                        {conta.status === 'previsto' && isDatePast(conta.data_vencimento) && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Vencido
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
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
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleConfirmarRecebimento(conta)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10 gap-1"
                            onClick={() => handleVoucherFatura(conta)}
                            title="Gerar fatura em PDF"
                          >
                            <FileDown className="h-4 w-4" />
                            Fatura
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(conta)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDelete(conta.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Dialog Confirmar Recebimento */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
            <DialogDescription>
              Selecione a conta bancária para registro do recebimento
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
              <div className="p-4 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm"><strong>Cliente:</strong> {getClienteNome(selectedConta.cliente_id)}</p>
                <p className="text-sm"><strong>Valor:</strong> {formatCurrency(selectedConta.valor)}</p>
                <p className="text-sm"><strong>Vencimento:</strong> {formatDate(selectedConta.data_vencimento)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={confirmarRecebimentoAction}
            >
              Confirmar Recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}