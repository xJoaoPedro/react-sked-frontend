export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export function formatTime(timeStr: string) {
  const date = new Date(timeStr);
  
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export function formatPrice(price: number, showCurrencySymbol: boolean = true) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: showCurrencySymbol ? 'currency' : undefined,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export function formatLimitText(text: string, limit: number) {
  if (text.length > limit) {
    return text.substring(0, (limit - 3)) + '...';
  }
  
  return text;
}