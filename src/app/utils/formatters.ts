// Funções utilitárias para o sistema

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

export function isDatePast(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = parseDate(dateString);
  return date < today;
}

export function getMonthYear(dateString: string): string {
  const [year, month] = dateString.split('-');
  return `${month}/${year}`;
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${year}-${month}`;
}

export function getMonthName(monthYear: string): string {
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    months.push(`${year}-${month}`);
  }
  
  return months;
}

export function getMonthNameShort(monthYear: string): string {
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'short' });
}

export function isCurrentMonth(competencia: string): boolean {
  return competencia === getCurrentMonthYear();
}

export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
