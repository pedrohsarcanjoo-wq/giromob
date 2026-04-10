import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

export function FluxoCaixa() {
  const { contasBancarias, contasReceber, contasPagar } = useApp();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState(`${currentYear}-${currentMonth}`);

  const [year, month] = selectedMonth.split('-');

  // Calcular saldo inicial do período
  const saldoInicial = contasBancarias
    .filter(c => c.ativo)
    .reduce((total, conta) => {
      const entradas = contasReceber
        .filter(c => {
          if (c.status !== 'recebido' || !c.data_recebimento) return false;
          return c.data_recebimento < `${year}-${month}-01` && c.conta_bancaria_id === conta.id;
        })
        .reduce((sum, c) => sum + c.valor, 0);

      const saidas = contasPagar
        .filter(c => {
          if (c.status !== 'pago' || !c.data_pagamento) return false;
          return c.data_pagamento < `${year}-${month}-01` && c.conta_bancaria_id === conta.id;
        })
        .reduce((sum, c) => sum + c.valor, 0);

      return total + conta.saldo_inicial + entradas - saidas;
    }, 0);

  // Entradas realizadas no mês
  const entradasRealizadas = contasReceber
    .filter(c => {
      if (c.status !== 'recebido' || !c.data_recebimento) return false;
      const [y, m] = c.data_recebimento.split('-');
      return y === year && m === month;
    })
    .reduce((sum, c) => sum + c.valor, 0);

  // Entradas previstas no mês
  const entradasPrevistas = contasReceber
    .filter(c => {
      if (c.status !== 'previsto') return false;
      const [y, m] = c.data_vencimento.split('-');
      return y === year && m === month;
    })
    .reduce((sum, c) => sum + c.valor, 0);

  // Saídas realizadas no mês
  const saidasRealizadas = contasPagar
    .filter(c => {
      if (c.status !== 'pago' || !c.data_pagamento) return false;
      const [y, m] = c.data_pagamento.split('-');
      return y === year && m === month;
    })
    .reduce((sum, c) => sum + c.valor, 0);

  // Saídas previstas no mês
  const saidasPrevistas = contasPagar
    .filter(c => {
      if (c.status !== 'previsto') return false;
      const [y, m] = c.data_vencimento.split('-');
      return y === year && m === month;
    })
    .reduce((sum, c) => sum + c.valor, 0);

  // Saldo final projetado
  const saldoFinalProjetado = saldoInicial + entradasRealizadas + entradasPrevistas - saidasRealizadas - saidasPrevistas;

  // Dados para gráfico de evolução diária
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  const dailyData = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;

    const entradasAteData = contasReceber
      .filter(c => {
        if (c.status !== 'recebido' || !c.data_recebimento) return false;
        return c.data_recebimento <= dateStr && c.data_recebimento >= `${year}-${month}-01`;
      })
      .reduce((sum, c) => sum + c.valor, 0);

    const entradasPrevistasAteData = contasReceber
      .filter(c => {
        if (c.status !== 'previsto') return false;
        return c.data_vencimento <= dateStr && c.data_vencimento >= `${year}-${month}-01`;
      })
      .reduce((sum, c) => sum + c.valor, 0);

    const saidasAteData = contasPagar
      .filter(c => {
        if (c.status !== 'pago' || !c.data_pagamento) return false;
        return c.data_pagamento <= dateStr && c.data_pagamento >= `${year}-${month}-01`;
      })
      .reduce((sum, c) => sum + c.valor, 0);

    const saidasPrevistasAteData = contasPagar
      .filter(c => {
        if (c.status !== 'previsto') return false;
        return c.data_vencimento <= dateStr && c.data_vencimento >= `${year}-${month}-01`;
      })
      .reduce((sum, c) => sum + c.valor, 0);

    const saldoRealizado = saldoInicial + entradasAteData - saidasAteData;
    const saldoProjetado = saldoInicial + entradasAteData + entradasPrevistasAteData - saidasAteData - saidasPrevistasAteData;

    dailyData.push({
      dia: day,
      saldoRealizado,
      saldoProjetado,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Fluxo de Caixa</h1>
          <p className="text-foreground/70 mt-1">Acompanhe suas entradas e saídas</p>
        </div>
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
      </div>

      {/* Resumo */}
      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-foreground">Resumo - {getMonthName(selectedMonth)}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="w-2/3 text-foreground/70">Componente</TableHead>
                <TableHead className="text-right text-foreground/70">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border/40">
                <TableCell className="font-medium text-foreground">Saldo Inicial do Período</TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {formatCurrency(saldoInicial)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-green-500/10 border-border/40">
                <TableCell className="font-medium text-green-400">
                  (+) Entradas Realizadas
                </TableCell>
                <TableCell className="text-right font-semibold text-green-400">
                  {formatCurrency(entradasRealizadas)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-green-500/5 border-border/40">
                <TableCell className="font-medium text-green-400/80">
                  (+) Entradas Previstas
                </TableCell>
                <TableCell className="text-right font-semibold text-green-400/80">
                  {formatCurrency(entradasPrevistas)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-red-500/10 border-border/40">
                <TableCell className="font-medium text-red-400">
                  (-) Saídas Realizadas
                </TableCell>
                <TableCell className="text-right font-semibold text-red-400">
                  {formatCurrency(saidasRealizadas)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-red-500/5 border-border/40">
                <TableCell className="font-medium text-red-400/80">
                  (-) Saídas Previstas
                </TableCell>
                <TableCell className="text-right font-semibold text-red-400/80">
                  {formatCurrency(saidasPrevistas)}
                </TableCell>
              </TableRow>
              <TableRow className="border-t-2 border-blue-500/30">
                <TableCell className="font-bold text-lg text-foreground">
                  = Saldo Final Projetado
                </TableCell>
                <TableCell className={`text-right font-bold text-lg ${saldoFinalProjetado >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {formatCurrency(saldoFinalProjetado)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução */}
      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-foreground">Evolução do Saldo ao Longo do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailyData}>
              <defs>
                <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProjetado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="dia" 
                stroke="#9CA3AF"
                label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                label={{ value: 'Saldo (R$)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Line
                type="monotone"
                dataKey="saldoRealizado"
                stroke="#10B981"
                strokeWidth={3}
                name="Saldo Realizado"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                fill="url(#colorRealizado)"
              />
              <Line
                type="monotone"
                dataKey="saldoProjetado"
                stroke="#3B82F6"
                strokeWidth={3}
                strokeDasharray="8 4"
                name="Saldo Projetado"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                fill="url(#colorProjetado)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}