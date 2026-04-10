import { useApp } from '../context/AppContext';
import { formatCurrency, isDatePast, getCurrentMonthYear } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

export function ScoreFinanceiro() {
  const { contasBancarias, contasReceber, contasPagar } = useApp();

  const currentMonth = getCurrentMonthYear();
  const currentDate = new Date();
  const currentMonthNum = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

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

  // Contar contas a pagar vencidas
  const contasPagarVencidas = contasPagar.filter(
    c => c.status === 'previsto' && isDatePast(c.data_vencimento)
  );

  // Calcular receita mensal (competência atual)
  const receitaMensal = contasReceber
    .filter(c => c.competencia === currentMonth)
    .reduce((sum, c) => sum + c.valor, 0);

  // Calcular despesas mensais (competência atual)
  const despesaMensal = contasPagar
    .filter(c => c.competencia === currentMonth)
    .reduce((sum, c) => sum + c.valor, 0);

  // Índice de endividamento
  const indiceEndividamento = receitaMensal > 0 ? (despesaMensal / receitaMensal) * 100 : 0;

  // Contar pagamentos no prazo (últimos 30 dias)
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 30);
  const dataLimiteStr = dataLimite.toISOString().split('T')[0];

  const pagamentosNoPrazo = contasPagar.filter(c => {
    if (c.status !== 'pago' || !c.data_pagamento) return false;
    return c.data_pagamento >= dataLimiteStr && c.data_pagamento <= c.data_vencimento;
  }).length;

  // CÁLCULO DO SCORE
  let score = 100;
  const penalidades: { motivo: string; valor: number }[] = [];
  const bonus: { motivo: string; valor: number }[] = [];

  // Penalidades
  if (contasPagarVencidas.length > 0) {
    const penalidade = contasPagarVencidas.length * 5;
    penalidades.push({
      motivo: `${contasPagarVencidas.length} conta(s) a pagar vencida(s)`,
      valor: penalidade,
    });
    score -= penalidade;
  }

  if (saldoAtual < 0) {
    penalidades.push({
      motivo: 'Saldo atual negativo',
      valor: 25,
    });
    score -= 25;
  }

  if (saldoProjetado < 0) {
    penalidades.push({
      motivo: 'Saldo projetado negativo',
      valor: 20,
    });
    score -= 20;
  }

  if (indiceEndividamento > 80) {
    penalidades.push({
      motivo: `Índice de endividamento alto (${indiceEndividamento.toFixed(1)}%)`,
      valor: 15,
    });
    score -= 15;
  }

  // Bônus
  if (pagamentosNoPrazo > 0) {
    const bonusValor = Math.min(pagamentosNoPrazo * 2, 20); // Máximo 20 pontos de bônus
    bonus.push({
      motivo: `${pagamentosNoPrazo} pagamento(s) realizado(s) no prazo`,
      valor: bonusValor,
    });
    score += bonusValor;
  }

  // Garantir que o score fique entre 0 e 100
  score = Math.max(0, Math.min(100, score));

  // Classificação
  let classificacao: { label: string; cor: string; bgColor: string };
  if (score >= 80) {
    classificacao = { label: 'Saudável', cor: 'text-green-600', bgColor: 'bg-green-600' };
  } else if (score >= 50) {
    classificacao = { label: 'Atenção', cor: 'text-yellow-600', bgColor: 'bg-yellow-500' };
  } else {
    classificacao = { label: 'Crítico', cor: 'text-red-600', bgColor: 'bg-red-600' };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Score Financeiro</h1>
        <p className="text-foreground/70 mt-1">Avaliação da saúde financeira em tempo real</p>
      </div>

      {/* Score Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-foreground">Score Atual</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            {/* Gauge Visual */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#2D3E57"
                  strokeWidth="20"
                />
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="20"
                  strokeDasharray={`${(score / 100) * 502.65} 502.65`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${classificacao.cor.replace('text-', 'text-')}`} style={{
                  color: score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
                }}>
                  {Math.round(score)}
                </span>
                <span className="text-sm text-foreground/60 mt-1">de 100</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Badge
                className={`${classificacao.bgColor} text-white text-lg px-6 py-2 shadow-lg`}
                style={{
                  boxShadow: `0 0 20px ${score >= 80 ? 'rgba(16, 185, 129, 0.3)' : score >= 50 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                {classificacao.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-foreground">Indicadores Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div>
                <p className="text-sm text-foreground/60">Saldo Atual</p>
                <p className={`text-lg font-semibold ${saldoAtual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(saldoAtual)}
                </p>
              </div>
              {saldoAtual >= 0 ? (
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div>
                <p className="text-sm text-foreground/60">Saldo Projetado</p>
                <p className={`text-lg font-semibold ${saldoProjetado >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {formatCurrency(saldoProjetado)}
                </p>
              </div>
              {saldoProjetado >= 0 ? (
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div>
                <p className="text-sm text-foreground/60">Índice de Endividamento</p>
                <p className={`text-lg font-semibold ${indiceEndividamento > 80 ? 'text-red-400' : 'text-green-400'}`}>
                  {indiceEndividamento.toFixed(1)}%
                </p>
              </div>
              {indiceEndividamento > 80 ? (
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
              <div>
                <p className="text-sm text-foreground/60">Contas Vencidas</p>
                <p className={`text-lg font-semibold ${contasPagarVencidas.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {contasPagarVencidas.length}
                </p>
              </div>
              {contasPagarVencidas.length > 0 ? (
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Penalidades */}
        {penalidades.length > 0 && (
          <Card className="border-red-500/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <TrendingDown className="h-5 w-5" />
                Penalidades (-{penalidades.reduce((sum, p) => sum + p.valor, 0)} pontos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {penalidades.map((penalidade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-foreground">{penalidade.motivo}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-400">
                      -{penalidade.valor}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bônus */}
        {bonus.length > 0 && (
          <Card className="border-green-500/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <TrendingUp className="h-5 w-5" />
                Bônus (+{bonus.reduce((sum, b) => sum + b.valor, 0)} pontos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bonus.map((bonusItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-foreground">{bonusItem.motivo}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-400">
                      +{bonusItem.valor}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Orientações */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-foreground">Como Melhorar seu Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-foreground/80">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p>Pague suas contas em dia para evitar penalidades e ganhar pontos de bônus</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p>Mantenha seu saldo atual positivo para evitar perda de 25 pontos</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p>Planeje seus gastos para manter o saldo projetado positivo</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p>Mantenha o índice de endividamento abaixo de 80% da receita mensal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}