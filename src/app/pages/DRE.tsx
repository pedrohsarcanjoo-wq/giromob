import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { gerarDREPDF } from '../utils/pdfGenerator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DRE() {
  const { contasReceber, contasPagar, categorias } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState(`${currentYear}-${currentMonth}`);

  // Calcular valores por competência
  const receitaBruta = contasReceber
    .filter(c => c.competencia === selectedMonth)
    .reduce((sum, c) => sum + c.valor, 0);

  // Custos Operacionais
  const categoriasOperacionais = categorias.filter(c => c.tipo === 'operacional');
  const custosOperacionais = categoriasOperacionais.map(cat => {
    const total = contasPagar
      .filter(c => c.competencia === selectedMonth && c.categoria_id === cat.id)
      .reduce((sum, c) => sum + c.valor, 0);
    return { categoria: cat.nome, valor: total };
  });
  const totalCustosOperacionais = custosOperacionais.reduce((sum, c) => sum + c.valor, 0);

  const lucroBruto = receitaBruta - totalCustosOperacionais;

  // Despesas Administrativas
  const categoriasAdministrativas = categorias.filter(c => c.tipo === 'administrativo');
  const despesasAdministrativas = categoriasAdministrativas.map(cat => {
    const total = contasPagar
      .filter(c => c.competencia === selectedMonth && c.categoria_id === cat.id)
      .reduce((sum, c) => sum + c.valor, 0);
    return { categoria: cat.nome, valor: total };
  });
  const totalDespesasAdministrativas = despesasAdministrativas.reduce((sum, c) => sum + c.valor, 0);

  // Despesas Financeiras
  const categoriasFinanceiras = categorias.filter(c => c.tipo === 'financeiro');
  const despesasFinanceiras = categoriasFinanceiras.map(cat => {
    const total = contasPagar
      .filter(c => c.competencia === selectedMonth && c.categoria_id === cat.id)
      .reduce((sum, c) => sum + c.valor, 0);
    return { categoria: cat.nome, valor: total };
  });
  const totalDespesasFinanceiras = despesasFinanceiras.reduce((sum, c) => sum + c.valor, 0);

  const resultadoLiquido = lucroBruto - totalDespesasAdministrativas - totalDespesasFinanceiras;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 100)); // garante render
      gerarDREPDF({
        periodo: getMonthName(selectedMonth),
        receitaBruta,
        custosOperacionais,
        totalCustosOperacionais,
        lucroBruto,
        despesasAdministrativas,
        totalDespesasAdministrativas,
        despesasFinanceiras,
        totalDespesasFinanceiras,
        resultadoLiquido,
      });
      toast.success('DRE exportado com sucesso!');
    } catch {
      toast.error('Erro ao gerar o PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">DRE - Demonstrativo de Resultados</h1>
          <p className="text-foreground/70 mt-1">Análise por regime de competência</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <Label htmlFor="month" className="text-foreground/70">Período</Label>
            <Input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="mt-6 border-border/40 gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {isExporting ? 'Gerando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-foreground">DRE - {getMonthName(selectedMonth)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 font-mono text-sm">
            {/* Receita Bruta */}
            <div className="py-3 border-b border-border/40">
              <div className="font-bold text-base mb-2 text-foreground">(+) RECEITA BRUTA</div>
              <div className="flex justify-between pl-8">
                <span className="text-foreground/70">Clientes / Fretes</span>
                <span className="font-semibold text-green-400">
                  {formatCurrency(receitaBruta)}
                </span>
              </div>
            </div>

            {/* Custos Operacionais */}
            <div className="py-3 border-b border-border/40">
              <div className="font-bold text-base mb-2 text-foreground">(-) CUSTOS OPERACIONAIS</div>
              {custosOperacionais.map((item, index) => (
                item.valor > 0 && (
                  <div key={index} className="flex justify-between pl-8 py-0.5">
                    <span className="text-foreground/70">{item.categoria}</span>
                    <span className="text-red-400">
                      {formatCurrency(item.valor)}
                    </span>
                  </div>
                )
              ))}
              {totalCustosOperacionais > 0 && (
                <div className="flex justify-between pl-8 pt-2 border-t border-border/30 mt-2">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-red-400">
                    {formatCurrency(totalCustosOperacionais)}
                  </span>
                </div>
              )}
            </div>

            {/* Lucro Bruto */}
            <div className="py-3 border-b border-border/40 bg-muted/20">
              <div className="flex justify-between px-4">
                <span className="font-bold text-base text-foreground">= LUCRO BRUTO</span>
                <span className={`font-bold text-lg ${lucroBruto >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(lucroBruto)}
                </span>
              </div>
            </div>

            {/* Despesas Administrativas */}
            {totalDespesasAdministrativas > 0 && (
              <div className="py-3 border-b border-border/40">
                <div className="font-bold text-base mb-2 text-foreground">(-) DESPESAS ADMINISTRATIVAS</div>
                {despesasAdministrativas.map((item, index) => (
                  item.valor > 0 && (
                    <div key={index} className="flex justify-between pl-8 py-0.5">
                      <span className="text-foreground/70">{item.categoria}</span>
                      <span className="text-red-400">
                        {formatCurrency(item.valor)}
                      </span>
                    </div>
                  )
                ))}
                <div className="flex justify-between pl-8 pt-2 border-t border-border/30 mt-2">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-red-400">
                    {formatCurrency(totalDespesasAdministrativas)}
                  </span>
                </div>
              </div>
            )}

            {/* Despesas Financeiras */}
            {totalDespesasFinanceiras > 0 && (
              <div className="py-3 border-b border-border/40">
                <div className="font-bold text-base mb-2 text-foreground">(-) DESPESAS FINANCEIRAS</div>
                {despesasFinanceiras.map((item, index) => (
                  item.valor > 0 && (
                    <div key={index} className="flex justify-between pl-8 py-0.5">
                      <span className="text-foreground/70">{item.categoria}</span>
                      <span className="text-red-400">
                        {formatCurrency(item.valor)}
                      </span>
                    </div>
                  )
                ))}
                <div className="flex justify-between pl-8 pt-2 border-t border-border/30 mt-2">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-red-400">
                    {formatCurrency(totalDespesasFinanceiras)}
                  </span>
                </div>
              </div>
            )}

            {/* Resultado Líquido */}
            <div className="py-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg">
              <div className="flex justify-between px-4">
                <span className="font-bold text-lg text-foreground">= RESULTADO LÍQUIDO</span>
                <span className={`font-bold text-2xl ${resultadoLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(resultadoLiquido)}
                </span>
              </div>
            </div>
          </div>

          {/* Informação importante */}
          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-400">
              <strong>Importante:</strong> Este relatório utiliza o regime de competência, 
              considerando o campo "Competência" dos lançamentos, independente da data de 
              pagamento ou recebimento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}