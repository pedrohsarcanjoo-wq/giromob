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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Pencil, Power, PowerOff, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { CategoriaCusto, TipoCategoria } from '../types';

export function Categorias() {
  const { categorias, addCategoria, updateCategoria } = useApp();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaCusto | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'operacional' as TipoCategoria,
    cor: '#6B7280',
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'operacional',
      cor: '#6B7280',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome) {
      toast.error('Preencha o nome da categoria');
      return;
    }

    const data = {
      nome: formData.nome,
      tipo: formData.tipo,
      cor: formData.cor,
      ativo: true,
    };

    if (selectedCategoria) {
      updateCategoria(selectedCategoria.id, data);
      toast.success('Categoria atualizada com sucesso!');
    } else {
      addCategoria(data);
      toast.success('Categoria criada com sucesso!');
    }

    setDialogOpen(false);
    setSelectedCategoria(null);
    resetForm();
  };

  const handleEdit = (categoria: CategoriaCusto) => {
    setSelectedCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      tipo: categoria.tipo,
      cor: categoria.cor,
    });
    setDialogOpen(true);
  };

  const toggleAtivo = (categoria: CategoriaCusto) => {
    updateCategoria(categoria.id, { ativo: !categoria.ativo });
    toast.success(`Categoria ${!categoria.ativo ? 'ativada' : 'desativada'} com sucesso!`);
  };

  const getTipoLabel = (tipo: TipoCategoria) => {
    const labels = {
      operacional: 'Operacional',
      administrativo: 'Administrativo',
      financeiro: 'Financeiro',
    };
    return labels[tipo];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Categorias de Custo</h1>
          <p className="text-foreground/70 mt-1">Organize suas despesas por categoria</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedCategoria(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategoria ? 'Editar' : 'Nova'} Categoria
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da categoria
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Combustível"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: TipoCategoria) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor"
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    placeholder="#6B7280"
                    className="flex-1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedCategoria(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90">
                  {selectedCategoria ? 'Atualizar' : 'Criar'}
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
                  <TableHead className="text-foreground/70">Nome</TableHead>
                  <TableHead className="text-foreground/70">Tipo</TableHead>
                  <TableHead className="text-foreground/70">Cor</TableHead>
                  <TableHead className="text-foreground/70">Status</TableHead>
                  <TableHead className="text-right text-foreground/70">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-inner ring-4 ring-background">
                          <Inbox className="w-10 h-10 text-primary opacity-80" />
                        </div>
                        <div>
                          <p className="text-xl font-medium text-foreground">Nenhuma categoria encontrada</p>
                          <p className="text-sm text-foreground/50 max-w-sm mx-auto mt-2">
                            Você ainda não cadastrou categorias. Crie categorias para organizar o seu fluxo de caixa e separar despesas de receitas.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map((categoria) => (
                    <TableRow key={categoria.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {categoria.nome}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {getTipoLabel(categoria.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-border/40"
                            style={{ backgroundColor: categoria.cor }}
                          />
                          <span className="text-sm text-foreground/70">{categoria.cor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoria.ativo ? 'default' : 'secondary'} className={categoria.ativo ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {categoria.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border/40"
                            onClick={() => handleEdit(categoria)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={categoria.ativo ? 'destructive' : 'default'}
                            onClick={() => toggleAtivo(categoria)}
                          >
                            {categoria.ativo ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
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