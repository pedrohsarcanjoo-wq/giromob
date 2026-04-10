import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
import { Plus, Pencil, Power, PowerOff, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { ContaBancaria, TipoConta } from '../types';

export function ContasBancarias() {
  const { contasBancarias, contasReceber, contasPagar, addContaBancaria, updateContaBancaria } = useApp();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaBancaria | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'conta_corrente' as TipoConta,
    saldo_inicial: '',
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'conta_corrente',
      saldo_inicial: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.saldo_inicial) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const data = {
      nome: formData.nome,
      tipo: formData.tipo,
      saldo_inicial: parseFloat(formData.saldo_inicial),
      ativo: true,
    };

    if (selectedConta) {
      updateContaBancaria(selectedConta.id, data);
      toast.success('Conta atualizada com sucesso!');
    } else {
      addContaBancaria(data);
      toast.success('Conta criada com sucesso!');
    }

    setDialogOpen(false);
    setSelectedConta(null);
    resetForm();
  };

  const handleEdit = (conta: ContaBancaria) => {
    setSelectedConta(conta);
    setFormData({
      nome: conta.nome,
      tipo: conta.tipo,
      saldo_inicial: conta.saldo_inicial.toString(),
    });
    setDialogOpen(true);
  };

  const toggleAtivo = (conta: ContaBancaria) => {
    // Verificar se tem lançamentos vinculados
    const temLancamentos = 
      contasReceber.some(c => c.conta_bancaria_id === conta.id) ||
      contasPagar.some(c => c.conta_bancaria_id === conta.id);

    if (temLancamentos && conta.ativo) {
      toast.warning('Esta conta possui lançamentos vinculados. Ela será desativada.');
    }

    updateContaBancaria(conta.id, { ativo: !conta.ativo });
    toast.success(`Conta ${!conta.ativo ? 'ativada' : 'desativada'} com sucesso!`);
  };

  const calcularSaldo = (conta: ContaBancaria) => {
    const entradas = contasReceber
      .filter(c => c.status === 'recebido' && c.conta_bancaria_id === conta.id)
      .reduce((sum, c) => sum + c.valor, 0);

    const saidas = contasPagar
      .filter(c => c.status === 'pago' && c.conta_bancaria_id === conta.id)
      .reduce((sum, c) => sum + c.valor, 0);

    return conta.saldo_inicial + entradas - saidas;
  };

  const calcularSaldoProjetado = (conta: ContaBancaria) => {
    const saldoAtual = calcularSaldo(conta);
    
    const entradasPrevistas = contasReceber
      .filter(c => c.status === 'previsto')
      .reduce((sum, c) => sum + c.valor, 0);

    const saidasPrevistas = contasPagar
      .filter(c => c.status === 'previsto')
      .reduce((sum, c) => sum + c.valor, 0);

    return saldoAtual + entradasPrevistas - saidasPrevistas;
  };

  const getTipoLabel = (tipo: TipoConta) => {
    const labels = {
      conta_corrente: 'Conta Corrente',
      caixa: 'Caixa',
      carteira_digital: 'Carteira Digital',
    };
    return labels[tipo];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Contas Bancárias</h1>
          <p className="text-foreground/70 mt-1">Gerencie suas contas</p>
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
              Nova Conta Bancária
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedConta ? 'Editar' : 'Nova'} Conta Bancária
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da conta bancária
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Conta *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Conta Corrente Banco do Brasil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: TipoConta) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="carteira_digital">Carteira Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="saldo_inicial">Saldo Inicial (R$) *</Label>
                <Input
                  id="saldo_inicial"
                  type="number"
                  step="0.01"
                  value={formData.saldo_inicial}
                  onChange={(e) => setFormData({ ...formData, saldo_inicial: e.target.value })}
                  placeholder="0,00"
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

      {/* Cards de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contasBancarias.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center space-y-4 py-16 bg-card/30 border border-border/40 rounded-xl">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-inner ring-4 ring-background">
              <Wallet className="w-10 h-10 text-primary opacity-80" />
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-foreground">Ainda não há contas cadastradas</p>
              <p className="text-sm text-foreground/50 max-w-sm mx-auto mt-2 text-center">
                Configure suas Contas Correntes, Caixas ou Carteiras Digitais para poder realizar recebimentos e pagamentos.
              </p>
            </div>
          </div>
        ) : (
          contasBancarias.map((conta) => {
            const saldoAtual = calcularSaldo(conta);
            const saldoProjetado = calcularSaldoProjetado(conta);

            return (
              <Card key={conta.id} className={`relative overflow-hidden border-border/40 bg-gradient-to-br from-card to-card/50 ${!conta.ativo ? 'opacity-60' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-foreground">{conta.nome}</CardTitle>
                      <Badge variant="secondary" className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {getTipoLabel(conta.tipo)}
                      </Badge>
                    </div>
                    {!conta.ativo && (
                      <Badge variant="destructive">Inativa</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div>
                    <p className="text-sm text-foreground/60">Saldo Inicial</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(conta.saldo_inicial)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/60">Saldo Atual</p>
                    <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(saldoAtual)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/60">Saldo Projetado</p>
                    <p className={`text-lg font-semibold ${saldoProjetado >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatCurrency(saldoProjetado)}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border/40"
                      onClick={() => handleEdit(conta)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={conta.ativo ? 'destructive' : 'default'}
                      onClick={() => toggleAtivo(conta)}
                    >
                      {conta.ativo ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}