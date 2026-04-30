import { useApp } from '../context/AppContext';
import { formatCurrency, getCurrentMonthYear, isDatePast, getLast6Months, getMonthNameShort } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  CreditCard,
  AlertCircle,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function Dashboard() {
  const { contasBancarias, contasReceber, contasPagar, categorias, refreshData, isLoadingData } = useApp();

  const currentMonth = getCurrentMonthYear();
  const currentDate = new Date();
  const currentMonthNum = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Calcular KPIs
  const faturamentoMes = contasReceber
    .filter(c => {
      if (c.status !== 'recebido' || !c.data_recebimento) return false;
      const [year, month] = c.data_recebimento.split('-');
      return parseInt(year) === currentYear && parseInt(month) === currentMonthNum;
    })
    .reduce((sum, c) => sum + c.valor, 0);

  const despesasMes = contasPagar
    .filter(c => {
      if (c.status !== 'pago' || !c.data_pagamento) return false;
      const [year, month] = c.data_pagamento.split('-');
      return parseInt(year) === currentYear && parseInt(month) === currentMonthNum;
    })
    .reduce((sum, c) => sum + c.valor, 0);

  const lucroPrejuizo = faturamentoMes - despesasMes;

  // Calcular saldo atual
  const saldoAtual = contasBancarias
    .filter(c => c.ativo)
    .reduce((total, conta) => {
      const entradas = contasReceber
        .filter(c => c.status === 'recebido' && c.conta_bancaria_id === conta.id)
        .reduce((sum, c) => sum + c.valor, 0);
      
      const saidas = contasPagar
        .filter(c => c.status === 'pago' && c.conta_bancaria_id === conta.id)
        .reduce((sum, c) => sum + c.valor, 0);
      
      return total + conta.saldo_inicial + entradas - saidas;
    }, 0);

  // Calcular saldo projetado
  const contasReceberPrevistas = contasReceber
    .filter(c => c.status === 'previsto')
    .reduce((sum, c) => sum + c.valor, 0);

  const contasPagarPrevistas = contasPagar
    .filter(c => c.status === 'previsto')
    .reduce((sum, c) => sum + c.valor, 0);

  const saldoProjetado = saldoAtual + contasReceberPrevistas - contasPagarPrevistas;

  // Alertas
  const contasPagarVencidas = contasPagar.filter(
    c => c.status === 'previsto' && isDatePast(c.data_vencimento)
  ).length;

  const contasReceberVencidas = contasReceber.filter(
    c => c.status === 'previsto' && isDatePast(c.data_vencimento)
  ).length;

  // Dados para gráficos
  const last6Months = getLast6Months();
  
  // Evolução do saldo
  const saldoEvolution = last6Months.map(monthYear => {
    const [year, month] = monthYear.split('-');
    
    // Receitas recebidas até este mês
    const receitas = contasReceber
      .filter(c => {
        if (c.status !== 'recebido' || !c.data_recebimento) return false;
        return c.data_recebimento <= `${year}-${month}-31`;
      })
      .reduce((sum, c) => sum + c.valor, 0);
    
    // Despesas pagas até este mês
    const despesas = contasPagar
      .filter(c => {
        if (c.status !== 'pago' || !c.data_pagamento) return false;
        return c.data_pagamento <= `${year}-${month}-31`;
      })
      .reduce((sum, c) => sum + c.valor, 0);
    
    const saldoInicial = contasBancarias
      .filter(c => c.ativo)
      .reduce((sum, c) => sum + c.saldo_inicial, 0);
    
    return {
      mes: getMonthNameShort(monthYear),
      saldo: saldoInicial + receitas - despesas,
    };
  });

  // Receitas vs Despesas
  const receitasDespesas = last6Months.map(monthYear => {
    const [year, month] = monthYear.split('-');
    
    const receitas = contasReceber
      .filter(c => {
        if (c.status !== 'recebido' || !c.data_recebimento) return false;
        const [y, m] = c.data_recebimento.split('-');
        return y === year && m === month;
      })
      .reduce((sum, c) => sum + c.valor, 0);
    
    const despesas = contasPagar
      .filter(c => {
        if (c.status !== 'pago' || !c.data_pagamento) return false;
        const [y, m] = c.data_pagamento.split('-');
        return y === year && m === month;
      })
      .reduce((sum, c) => sum + c.valor, 0);
    
    return {
      mes: getMonthNameShort(monthYear),
      receitas,
      despesas,
    };
  });

  // Despesas por categoria
  const despesasPorCategoria = categorias
    .map(cat => {
      const total = contasPagar
        .filter(c => {
          if (c.categoria_id !== cat.id) return false;
          if (c.status !== 'pago' || !c.data_pagamento) return false;
          const [year, month] = c.data_pagamento.split('-');
          return parseInt(year) === currentYear && parseInt(month) === currentMonthNum;
        })
        .reduce((sum, c) => sum + c.valor, 0);
      
      return {
        nome: cat.nome,
        valor: total,
        cor: cat.cor,
      };
    })
    .filter(item => item.valor > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-foreground/70 mt-1">Visão geral do sistema financeiro</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refreshData()} 
          disabled={isLoadingData}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoadingData && "animate-spin")} />
          <span className="hidden sm:inline">Atualizar Dados</span>
        </Button>
      </div>

      {/* Alertas */}
      {(contasPagarVencidas > 0 || contasReceberVencidas > 0) && (
        <div className="flex flex-wrap gap-3">
          {contasPagarVencidas > 0 && (
            <Badge variant="destructive" className="text-sm py-2 px-4 shadow-lg shadow-destructive/20">
              <AlertCircle className="h-4 w-4 mr-2" />
              {contasPagarVencidas} conta(s) a pagar vencida(s)
            </Badge>
          )}
          {contasReceberVencidas > 0 && (
            <Badge className="text-sm py-2 px-4 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20">
              <AlertCircle className="h-4 w-4 mr-2" />
              {contasReceberVencidas} conta(s) a receber vencida(s)
            </Badge>
          )}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Faturamento do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(faturamentoMes)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-red-500/20 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Despesas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(despesasMes)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "relative overflow-hidden bg-gradient-to-br from-card to-card/50",
          lucroPrejuizo >= 0 ? "border-green-500/20" : "border-red-500/20"
        )}>
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br to-transparent",
            lucroPrejuizo >= 0 ? "from-green-500/10" : "from-red-500/10"
          )} />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Lucro / Prejuízo
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${lucroPrejuizo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(lucroPrejuizo)}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                lucroPrejuizo >= 0 ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                {lucroPrejuizo >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {formatCurrency(saldoAtual)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="text-sm font-medium text-foreground/70">
              Saldo Projetado
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${saldoProjetado >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {formatCurrency(saldoProjetado)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução do Saldo */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-foreground">Evolução do Saldo (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={saldoEvolution}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="mes" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#1A2942',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    color: '#E5E7EB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Saldo"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#60A5FA' }}
                  fill="url(#colorSaldo)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Receitas vs Despesas */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-foreground">Receitas vs Despesas (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={receitasDespesas}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="mes" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: '#1A2942',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    color: '#E5E7EB'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#E5E7EB' }}
                />
                <Bar dataKey="receitas" fill="url(#colorReceitas)" name="Receitas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="despesas" fill="url(#colorDespesas)" name="Despesas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Despesas por Categoria */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-foreground">Distribuição de Despesas por Categoria (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          {despesasPorCategoria.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-16 bg-card/30 border border-border/40 rounded-xl">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-inner ring-4 ring-background">
                <PieChartIcon className="w-10 h-10 text-primary opacity-80" />
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-foreground">Nenhuma despesa neste mês</p>
                <p className="text-sm text-foreground/50 max-w-sm mx-auto mt-2 text-center">
                  Este gráfico será gerado automaticamente assim que você registrar e pagar a sua primeira despesa.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.nome}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {despesasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: '#1A2942',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      color: '#E5E7EB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 min-w-[200px]">
                {despesasPorCategoria.map((item, index) => (
                  <div key={index} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-lg" 
                        style={{ backgroundColor: item.cor }}
                      />
                      <span className="text-sm text-foreground">{item.nome}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}