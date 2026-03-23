/**
 * Format number as Nigerian Naira currency.
 */
export function formatNaira(amount: number): string {
  return `\u20A6${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Format phone number for display.
 */
export function formatPhone(phone: string): string {
  if (phone.startsWith('+234')) {
    return phone.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  return phone.replace(/^(0)(\d{3})(\d{3})(\d{4})/, '$1$2 $3 $4');
}

/**
 * Format date relative to now.
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
