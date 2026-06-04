export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('57')) {
    return '57' + cleaned;
  }
  return cleaned;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  return /^57\d{10}$/.test(formatted);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const parsePhoneList = (input: string): string[] => {
  return input
    .split(/[\n,;]+/)
    .map(phone => phone.trim())
    .filter(phone => phone.length > 0)
    .map(formatPhoneNumber)
    .filter(phone => isValidPhoneNumber(phone));
};
