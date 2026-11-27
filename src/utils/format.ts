export function formatRupiah(value: number, showSign = false): string {
  if (!Number.isFinite(value)) return 'Rp0';
  const rounded = Math.round(value);
  const absFormatted = new Intl.NumberFormat('id-ID').format(Math.abs(rounded));
  if (rounded < 0) return `-Rp${absFormatted}`;
  if (showSign && rounded > 0) return `+Rp${absFormatted}`;
  return `Rp${absFormatted}`;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(Math.round(value));
}

export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '0%';
  const fixed = Number(value.toFixed(decimals));
  return `${fixed.toString().replace('.', ',')}%`;
}

export function formatDateShort(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
