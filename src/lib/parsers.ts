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
  if (isNaN(price)) return 0;

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

export function formatPhone(phone: string) {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '').slice(0, 11);

  if (cleaned.length <= 2) {
    return cleaned.length === 0 ? '' : `(${cleaned}`;
  }

  if (cleaned.length <= 6) {
    return cleaned.replace(/^(\d{2})(\d+)$/, '($1) $2');
  }

  if (cleaned.length <= 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3');
  }

  return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}
