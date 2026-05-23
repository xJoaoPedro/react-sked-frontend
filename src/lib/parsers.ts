export const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isDateOnlyString = (value: string | number | Date): value is string =>
  typeof value === "string" && DATE_ONLY_REGEX.test(value);

const getDateTimeParts = (value: string | number | Date, timeZone = SAO_PAULO_TIME_ZONE) => {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
};

const getPartValue = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((part) => part.type === type)?.value ?? "";

export function getDateKeyInTimeZone(value: string | number | Date, timeZone = SAO_PAULO_TIME_ZONE) {
  if (isDateOnlyString(value)) {
    return value;
  }

  const parts = getDateTimeParts(value, timeZone);

  return `${getPartValue(parts, "year")}-${getPartValue(parts, "month")}-${getPartValue(parts, "day")}`;
}

export function getTimePartsInTimeZone(
  value: string | number | Date,
  timeZone = SAO_PAULO_TIME_ZONE,
) {
  const parts = getDateTimeParts(value, timeZone);

  return {
    hours: Number(getPartValue(parts, "hour")),
    minutes: Number(getPartValue(parts, "minute")),
  };
}

export function isSameDayInTimeZone(
  a: string | number | Date,
  b: string | number | Date,
  timeZone = SAO_PAULO_TIME_ZONE,
) {
  return getDateKeyInTimeZone(a, timeZone) === getDateKeyInTimeZone(b, timeZone);
}

export function dateKeyToIsoString(dateKey: string) {
  const localMidday = new Date(`${dateKey}T12:00:00`);

  return localMidday.toISOString();
}

export function formatDate(dateValue: string | number | Date) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: SAO_PAULO_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export function formatTime(timeValue: string | number | Date) {
  const date = timeValue instanceof Date ? timeValue : new Date(timeValue);
  
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: SAO_PAULO_TIME_ZONE,
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

  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.length > 11 && cleaned.startsWith('55')) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.length > 11) {
    cleaned = cleaned.slice(-11);
  }

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

export function formatCNPJ(cnpj: string) {
  if (!cnpj) return '';

  const cleaned = cnpj.replace(/\D/g, '').slice(0, 14);

  if (cleaned.length <= 2) {
    return cleaned;
  }

  if (cleaned.length <= 5) {
    return cleaned.replace(/^(\d{2})(\d+)$/, '$1.$2');
  }

  if (cleaned.length <= 8) {
    return cleaned.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
  }

  if (cleaned.length <= 12) {
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
  }

  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
