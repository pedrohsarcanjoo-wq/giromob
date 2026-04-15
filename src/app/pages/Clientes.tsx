import { useState } from 'react';
import { useApp } from '../context/AppContext';
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
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Pencil, Power, PowerOff, Inbox, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Cliente } from '../types';

export function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useApp();

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente/fornecedor? Esta ação não pode ser desfeita.')) {
      deleteCliente(id);
      toast.success('Cliente excluído com sucesso!');
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    telefone: '',
    email: '',
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      documento: '',
      telefone: '',
      email: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome) {
      toast.error('Preencha o nome do cliente');
      return;
    }

    const data = {
      nome: formData.nome,
      documento: formData.documento || undefined,
      telefone: formData.telefone || undefined,
      email: formData.email || undefined,
      ativo: true,
    };

    if (selectedCliente) {
      updateCliente(selectedCliente.id, data);
      toast.success('Cliente atualizado com sucesso!');
    } else {
      addCliente(data);
      toast.success('Cliente criado com sucesso!');
    }

    setDialogOpen(false);
    setSelectedCliente(null);
    resetForm();
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nome: cliente.nome,
      documento: cliente.documento || '',
      telefone: cliente.telefone || '',
      email: cliente.email || '',
    });
    setDialogOpen(true);
  };

  const toggleAtivo = (cliente: Cliente) => {
    updateCliente(cliente.id, { ativo: !cliente.ativo });
    toast.success(`Cliente ${!cliente.ativo ? 'ativado' : 'desativado'} com sucesso!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Clientes</h1>
          <p className="text-foreground/70 mt-1">Gerencie seus clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedCliente(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCliente ? 'Editar' : 'Novo'} Cliente
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome / Razão Social *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Transportadora Alpha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento">CNPJ / CPF</Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@cliente.com.br"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedCliente(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90">
                  {selectedCliente ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-foreground/70">Nome / Razão Social</TableHead>
                  <TableHead className="text-foreground/70">Documento</TableHead>
                  <TableHead className="text-foreground/70">Telefone</TableHead>
                  <TableHead className="text-foreground/70">E-mail</TableHead>
                  <TableHead className="text-foreground/70">Status</TableHead>
                  <TableHead className="text-right text-foreground/70">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-inner ring-4 ring-background">
                          <Inbox className="w-10 h-10 text-primary opacity-80" />
                        </div>
                        <div>
                          <p className="text-xl font-medium text-foreground">Nenhum cliente ou fornecedor cadastrado</p>
                          <p className="text-sm text-foreground/50 max-w-sm mx-auto mt-2">
                            A sua carteira de contatos está vazia. Adicione novas empresas ou pessoas físicas para vincular às suas transações financeiras!
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clientes.map((cliente) => (
                    <TableRow key={cliente.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {cliente.nome}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {cliente.documento || '-'}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {cliente.telefone || '-'}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {cliente.email || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cliente.ativo ? 'default' : 'secondary'} className={cliente.ativo ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {cliente.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border/40"
                            onClick={() => handleEdit(cliente)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={cliente.ativo ? 'destructive' : 'default'}
                            onClick={() => toggleAtivo(cliente)}
                          >
                            {cliente.ativo ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDelete(cliente.id)}
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
    </div>
  );
}