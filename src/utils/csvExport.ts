import { MarketplacePreset, SavedProduct } from '../types';
import { formatDateShort } from './format';

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportProductsToCsv(
  products: SavedProduct[],
  presets: MarketplacePreset[]
): void {
  const presetMap = new Map(presets.map((p) => [p.id, p.name]));

  const headers = [
    'Nama Produk',
    'Kategori',
    'Platform',
    'Total HPP (Rp)',
    'Harga Jual (Rp)',
    'Potongan Marketplace (Rp)',
    'Uang Cair (Rp)',
    'Profit Bersih (Rp)',
    'Margin (%)',
    'Status Margin',
    'Tanggal Update',
  ];

  const statusLabels: Record<string, string> = {
    boncos: 'Boncos (Rugi)',
    tipis: 'Tipis (Rawan)',
    sehat: 'Sehat',
    tebal: 'Tebal (Optimal)',
  };

  const rows = products.map((p) => [
    p.name,
    p.category || '-',
    presetMap.get(p.input.presetId) || 'Custom',
    Math.round(p.result.totalHpp),
    Math.round(p.result.finalSellingPrice),
    Math.round(p.result.totalMarketplaceFeeRp),
    Math.round(p.result.netPayout),
    Math.round(p.result.netProfit),
    Number(p.result.netMarginPercent.toFixed(1)),
    statusLabels[p.result.healthStatus] || p.result.healthStatus,
    formatDateShort(p.updatedAt),
  ]);

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];

  // UTF-8 BOM so Microsoft Excel opens Indonesian characters & formatting cleanly
  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateTag = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `marginku-produk-${dateTag}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
