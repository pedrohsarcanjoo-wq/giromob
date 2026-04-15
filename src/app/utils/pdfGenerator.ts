import jsPDF from 'jspdf';

// ─── Paleta de cores GiroMob ────────────────────────────────────────────────
const COLORS = {
  primary:    [37,  99,  235] as [number, number, number], // blue-600
  success:    [22,  163, 74]  as [number, number, number], // green-600
  danger:     [220, 38,  38]  as [number, number, number], // red-600
  dark:       [15,  23,  42]  as [number, number, number], // slate-900
  mid:        [71,  85,  105] as [number, number, number], // slate-600
  light:      [148, 163, 184] as [number, number, number], // slate-400
  muted:      [241, 245, 249] as [number, number, number], // slate-100
  white:      [255, 255, 255] as [number, number, number],
  border:     [226, 232, 240] as [number, number, number], // slate-200
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function R(v: number): number { return v; } // alias legibilidade

function setFill(doc: jsPDF, color: [number, number, number]) {
  doc.setFillColor(...color);
}
function setDraw(doc: jsPDF, color: [number, number, number]) {
  doc.setDrawColor(...color);
}
function setTextColor(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(...color);
}

function formatCurrencyPDF(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDatePDF(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function todayStr(): string {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ─── Cabeçalho padrão compartilhado ─────────────────────────────────────────
function drawHeader(doc: jsPDF, title: string, subtitle: string, accentColor: [number,number,number] = COLORS.primary) {
  const pw = doc.internal.pageSize.getWidth();

  // Barra topo
  setFill(doc, accentColor);
  doc.rect(0, 0, pw, 28, 'F');

  // Logo / nome empresa
  setTextColor(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GiroMob', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Sistema Financeiro', 14, 17);

  // Título do documento (direita)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, pw - 14, 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(subtitle, pw - 14, 17, { align: 'right' });

  // Linha separadora
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(14, 32, pw - 14, 32);
}

// ─── Rodapé padrão ──────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, pageNum: number) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(14, ph - 16, pw - 14, ph - 16);

  setTextColor(doc, COLORS.light);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`GiroMob — Emitido em ${todayStr()}`, 14, ph - 10);
  doc.text(`Pág. ${pageNum}`, pw - 14, ph - 10, { align: 'right' });
}

// ─── Caixa de informação ─────────────────────────────────────────────────────
function drawInfoBox(
  doc: jsPDF,
  x: number, y: number, w: number,
  label: string, value: string,
  accent: [number,number,number] = COLORS.primary,
) {
  setFill(doc, COLORS.muted);
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, 16, 2, 2, 'FD');

  // barra lateral colorida
  setFill(doc, accent);
  doc.rect(x, y, 2, 16, 'F');

  setTextColor(doc, COLORS.light);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(label.toUpperCase(), x + 6, y + 5.5);

  setTextColor(doc, COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(value, x + 6, y + 12);
}

// ════════════════════════════════════════════════════════════════════════════
// 1. VOUCHER DE PAGAMENTO REALIZADO
// ════════════════════════════════════════════════════════════════════════════
export interface VoucherPagamentoData {
  fornecedor: string;
  descricao?: string;
  valor: number;
  data_pagamento: string;
  data_vencimento: string;
  categoria: string;
  conta_bancaria?: string;
  parcela_atual?: number;
  total_parcelas?: number;
  id: string;
}

export function gerarVoucherPagamento(data: VoucherPagamentoData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pw = doc.internal.pageSize.getWidth();

  drawHeader(doc, 'COMPROVANTE DE PAGAMENTO', 'Voucher Oficial', COLORS.primary);

  // ── Selo de confirmação ──────────────────────────────────────────────────
  let y = 40;
  setFill(doc, [240, 253, 244]);
  setDraw(doc, [134, 239, 172]);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, pw - 28, 22, 3, 3, 'FD');

  setTextColor(doc, COLORS.success);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('✓  PAGAMENTO REALIZADO COM SUCESSO', pw / 2, y + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Data do pagamento: ${formatDatePDF(data.data_pagamento)}`, pw / 2, y + 17, { align: 'center' });

  // ── Valor em destaque ────────────────────────────────────────────────────
  y += 30;
  setFill(doc, COLORS.primary);
  doc.roundedRect(pw / 2 - 35, y, 70, 18, 3, 3, 'F');
  setTextColor(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(formatCurrencyPDF(data.valor), pw / 2, y + 12, { align: 'center' });

  if (data.parcela_atual && data.total_parcelas) {
    setTextColor(doc, COLORS.light);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Parcela ${data.parcela_atual}/${data.total_parcelas}`, pw / 2, y + 21, { align: 'center' });
    y += 8;
  }

  // ── Detalhes ─────────────────────────────────────────────────────────────
  y += 28;
  const colW = (pw - 28 - 6) / 2;
  drawInfoBox(doc, 14, y, colW, 'Fornecedor / Beneficiário', data.fornecedor, COLORS.primary);
  drawInfoBox(doc, 14 + colW + 6, y, colW, 'Categoria', data.categoria, COLORS.primary);

  y += 22;
  drawInfoBox(doc, 14, y, colW, 'Vencimento Original', formatDatePDF(data.data_vencimento), COLORS.mid);
  drawInfoBox(doc, 14 + colW + 6, y, colW, 'Conta de Débito', data.conta_bancaria || 'Não informada', COLORS.mid);

  if (data.descricao) {
    y += 22;
    setFill(doc, COLORS.muted);
    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, pw - 28, 18, 2, 2, 'FD');

    setTextColor(doc, COLORS.light);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('DESCRIÇÃO / OBSERVAÇÃO', 18, y + 6);

    setTextColor(doc, COLORS.dark);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(data.descricao, pw - 36);
    doc.text(lines[0], 18, y + 13);
  }

  // ── Nº do documento ──────────────────────────────────────────────────────
  y += 30;
  setTextColor(doc, COLORS.light);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Nº do Documento: ${data.id.substring(0, 20).toUpperCase()}`, 14, y);

  drawFooter(doc, 1);
  doc.save(`voucher-pagamento-${data.fornecedor.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

// ════════════════════════════════════════════════════════════════════════════
// 2. VOUCHER DE FATURA DE SERVIÇO (Contas a Receber)
// ════════════════════════════════════════════════════════════════════════════
export interface VoucherFaturaData {
  cliente: string;
  descricao?: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'previsto' | 'recebido' | 'cancelado';
  conta_bancaria?: string;
  competencia: string;
  id: string;
}

export function gerarVoucherFatura(data: VoucherFaturaData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pw = doc.internal.pageSize.getWidth();

  const isPago = data.status === 'recebido';
  const accentColor = isPago ? COLORS.success : COLORS.primary;

  drawHeader(doc, 'FATURA DE SERVIÇO', `Referência: ${data.competencia.split('-').reverse().join('/')}`, accentColor);

  // ── Status da fatura ─────────────────────────────────────────────────────
  let y = 40;
  const statusConfig = {
    recebido:  { bg: [240, 253, 244] as [number,number,number], border: [134, 239, 172] as [number,number,number], label: '✓  FATURA RECEBIDA / QUITADA', color: COLORS.success },
    previsto:  { bg: [239, 246, 255] as [number,number,number], border: [147, 197, 253] as [number,number,number], label: '⏳  AGUARDANDO PAGAMENTO', color: COLORS.primary },
    cancelado: { bg: [254, 242, 242] as [number,number,number], border: [252, 165, 165] as [number,number,number], label: '✕  FATURA CANCELADA', color: COLORS.danger },
  };
  const sCfg = statusConfig[data.status];

  setFill(doc, sCfg.bg);
  setDraw(doc, sCfg.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, pw - 28, 22, 3, 3, 'FD');

  setTextColor(doc, sCfg.color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(sCfg.label, pw / 2, y + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const dateLabel = isPago && data.data_recebimento
    ? `Recebido em: ${formatDatePDF(data.data_recebimento)}`
    : `Vencimento: ${formatDatePDF(data.data_vencimento)}`;
  doc.text(dateLabel, pw / 2, y + 17, { align: 'center' });

  // ── Valor ────────────────────────────────────────────────────────────────
  y += 30;
  setFill(doc, accentColor);
  doc.roundedRect(pw / 2 - 35, y, 70, 18, 3, 3, 'F');
  setTextColor(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(formatCurrencyPDF(data.valor), pw / 2, y + 12, { align: 'center' });

  // ── Detalhes ─────────────────────────────────────────────────────────────
  y += 28;
  const colW = (pw - 28 - 6) / 2;
  drawInfoBox(doc, 14, y, pw - 28, 'Cliente / Sacado', data.cliente, accentColor);

  y += 22;
  drawInfoBox(doc, 14, y, colW, 'Vencimento', formatDatePDF(data.data_vencimento), COLORS.mid);
  drawInfoBox(doc, 14 + colW + 6, y, colW, 'Competência', data.competencia.split('-').reverse().join('/'), COLORS.mid);

  if (isPago && data.data_recebimento) {
    y += 22;
    drawInfoBox(doc, 14, y, colW, 'Data de Recebimento', formatDatePDF(data.data_recebimento), COLORS.success);
    if (data.conta_bancaria) {
      drawInfoBox(doc, 14 + colW + 6, y, colW, 'Conta Bancária', data.conta_bancaria, COLORS.success);
    }
  }

  if (data.descricao) {
    y += 22;
    setFill(doc, COLORS.muted);
    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, pw - 28, 18, 2, 2, 'FD');

    setTextColor(doc, COLORS.light);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('DESCRIÇÃO DO SERVIÇO', 18, y + 6);

    setTextColor(doc, COLORS.dark);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(data.descricao, pw - 36);
    doc.text(lines[0], 18, y + 13);
  }

  // ── Nº do documento ──────────────────────────────────────────────────────
  y += 30;
  setTextColor(doc, COLORS.light);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Nº da Fatura: ${data.id.substring(0, 20).toUpperCase()}`, 14, y);
  doc.text(`GiroMob — Sistema Financeiro`, pw - 14, y, { align: 'right' });

  drawFooter(doc, 1);
  doc.save(`fatura-${data.cliente.replace(/\s+/g, '-').toLowerCase()}-${data.competencia}.pdf`);
}

// ════════════════════════════════════════════════════════════════════════════
// 3. DRE em PDF
// ════════════════════════════════════════════════════════════════════════════
export interface DrePDFData {
  periodo: string; // "Abril 2025"
  receitaBruta: number;
  custosOperacionais: { categoria: string; valor: number }[];
  totalCustosOperacionais: number;
  lucroBruto: number;
  despesasAdministrativas: { categoria: string; valor: number }[];
  totalDespesasAdministrativas: number;
  despesasFinanceiras: { categoria: string; valor: number }[];
  totalDespesasFinanceiras: number;
  resultadoLiquido: number;
}

export function gerarDREPDF(data: DrePDFData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pw = doc.internal.pageSize.getWidth();

  drawHeader(doc, 'DRE — DEMONSTRATIVO DE RESULTADOS', `Período: ${data.periodo}`, COLORS.primary);

  let y = 38;
  const margin = 14;
  const colLabel = margin + 4;
  const colValue = pw - margin;

  // ─── Função auxiliar para linhas ──────────────────────────────────────────
  const drawSection = (
    sectionLabel: string,
    items: { categoria: string; valor: number }[],
    total: number,
    totalLabel: string,
    totalColor: [number,number,number],
    sign: '+' | '-',
  ) => {
    // Cabeçalho da seção
    setFill(doc, COLORS.muted);
    doc.rect(margin, y, pw - margin * 2, 8, 'F');
    setTextColor(doc, COLORS.dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`(${sign}) ${sectionLabel}`, colLabel, y + 5.5);
    y += 8;

    // Itens
    items.filter(i => i.valor > 0).forEach(item => {
      setTextColor(doc, COLORS.mid);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(item.categoria, colLabel + 6, y + 5);

      setTextColor(doc, totalColor);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrencyPDF(item.valor), colValue, y + 5, { align: 'right' });

      setDraw(doc, COLORS.border);
      doc.setLineWidth(0.1);
      doc.line(margin, y + 7, pw - margin, y + 7);
      y += 7;
    });

    if (items.filter(i => i.valor > 0).length === 0) {
      setTextColor(doc, COLORS.light);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text('Nenhum lançamento neste período', colLabel + 6, y + 5);
      y += 7;
    }

    // Total da seção
    setFill(doc, [...totalColor.map(c => Math.min(255, c + 210))] as [number,number,number]);
    doc.rect(margin, y, pw - margin * 2, 8, 'F');
    setTextColor(doc, totalColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(totalLabel, colLabel + 4, y + 5.5);
    doc.text(formatCurrencyPDF(total), colValue, y + 5.5, { align: 'right' });
    y += 10;
  };

  const drawResultLine = (label: string, value: number, isMain = false) => {
    const color = value >= 0 ? COLORS.success : COLORS.danger;
    setFill(doc, isMain ? [...color.map(c => Math.max(0, c - 30))] as [number,number,number] : COLORS.muted);
    doc.rect(margin, y, pw - margin * 2, isMain ? 12 : 9, 'F');
    setTextColor(doc, isMain ? COLORS.white : color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isMain ? 11 : 9);
    doc.text(`= ${label}`, colLabel + 4, y + (isMain ? 8 : 6));
    doc.text(formatCurrencyPDF(value), colValue, y + (isMain ? 8 : 6), { align: 'right' });
    y += isMain ? 14 : 11;
  };

  // ─── Seções do DRE ───────────────────────────────────────────────────────
  y += 2;

  // Receita Bruta
  setFill(doc, COLORS.muted);
  doc.rect(margin, y, pw - margin * 2, 8, 'F');
  setTextColor(doc, COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('(+) RECEITA BRUTA', colLabel, y + 5.5);
  setTextColor(doc, COLORS.success);
  doc.text(formatCurrencyPDF(data.receitaBruta), colValue, y + 5.5, { align: 'right' });
  y += 8;

  setTextColor(doc, COLORS.mid);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Clientes / Fretes', colLabel + 6, y + 5);
  doc.text(formatCurrencyPDF(data.receitaBruta), colValue, y + 5, { align: 'right' });
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.1);
  doc.line(margin, y + 7, pw - margin, y + 7);
  y += 10;

  drawSection(
    'CUSTOS OPERACIONAIS',
    data.custosOperacionais,
    data.totalCustosOperacionais,
    'Total Custos Operacionais',
    COLORS.danger,
    '-',
  );

  drawResultLine('LUCRO BRUTO', data.lucroBruto);

  if (data.totalDespesasAdministrativas > 0) {
    drawSection(
      'DESPESAS ADMINISTRATIVAS',
      data.despesasAdministrativas,
      data.totalDespesasAdministrativas,
      'Total Despesas Administrativas',
      COLORS.danger,
      '-',
    );
  }

  if (data.totalDespesasFinanceiras > 0) {
    drawSection(
      'DESPESAS FINANCEIRAS',
      data.despesasFinanceiras,
      data.totalDespesasFinanceiras,
      'Total Despesas Financeiras',
      COLORS.danger,
      '-',
    );
  }

  y += 2;
  drawResultLine('RESULTADO LÍQUIDO', data.resultadoLiquido, true);

  // ─── Nota de rodapé ───────────────────────────────────────────────────────
  y += 6;
  setFill(doc, [239, 246, 255]);
  setDraw(doc, [147, 197, 253]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, pw - margin * 2, 14, 2, 2, 'FD');

  setTextColor(doc, COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Importante:', margin + 4, y + 5.5);

  setTextColor(doc, COLORS.mid);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'Este relatório utiliza o regime de competência, considerando o campo "Competência" dos lançamentos.',
    margin + 4, y + 10.5,
  );

  drawFooter(doc, 1);
  doc.save(`DRE-GiroMob-${data.periodo.replace(/\s+/g, '-')}.pdf`);
}
