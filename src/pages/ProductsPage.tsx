import React, { useMemo, useState } from 'react';
import { Download, Package, Search, X } from 'lucide-react';
import { HealthStatus, MarketplacePreset, SavedProduct } from '../types';
import { exportProductsToCsv } from '../utils/csvExport';
import { formatPercent } from '../utils/format';
import { ComparisonModal } from '../components/calculator/ComparisonModal';
import { ProductCard } from '../components/products/ProductCard';

interface ProductsPageProps {
  products: SavedProduct[];
  presets: MarketplacePreset[];
  onLoadProduct: (product: SavedProduct) => void;
  onDuplicateProduct: (product: SavedProduct) => void;
  onDeleteProduct: (id: string) => void;
  onExportDone: () => void;
  onGoCalculator: () => void;
}

type StatusFilter = 'all' | HealthStatus;

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  presets,
  onLoadProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onExportDone,
  onGoCalculator,
}) => {
  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [compareProduct, setCompareProduct] = useState<SavedProduct | null>(null);

  const presetMap = useMemo(() => new Map(presets.map((p) => [p.id, p.name])), [presets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      if (platformFilter !== 'all' && p.input.presetId !== platformFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'sehat') {
          if (p.result.healthStatus !== 'sehat' && p.result.healthStatus !== 'tebal') {
            return false;
          }
        } else if (p.result.healthStatus !== statusFilter) {
          return false;
        }
      }
      return true;
    });
  }, [products, query, platformFilter, statusFilter]);

  const avgMargin = useMemo(() => {
    if (products.length === 0) return 0;
    const sum = products.reduce((acc, p) => acc + p.result.netMarginPercent, 0);
    return sum / products.length;
  }, [products]);

  const handleExportCsv = () => {
    if (products.length === 0) return;
    exportProductsToCsv(filtered.length > 0 ? filtered : products, presets);
    onExportDone();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
            Katalog Produk
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Daftar produk dan hasil simulasi yang tersimpan
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={products.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Produk</p>
          <p className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 tabular-nums mt-0.5">
            {products.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Rata-rata Margin</p>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            {formatPercent(avgMargin)}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-7 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Belum Ada Produk Tersimpan
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Hitung produk Anda di tab Hitung, lalu tekan tombol Simpan agar semua harga jual dan profit tercatat rapi di sini.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoCalculator}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold"
          >
            Mulai Hitung Produk
          </button>
        </div>
      ) : (
        <>
          {/* Search & Filters */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama produk atau kategori..."
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-9 py-2.5 text-xs font-medium text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-lime-400/30"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all' as StatusFilter, label: 'Semua Status' },
                { id: 'boncos' as StatusFilter, label: 'Boncos' },
                { id: 'tipis' as StatusFilter, label: 'Tipis' },
                { id: 'sehat' as StatusFilter, label: 'Sehat & Tebal' },
              ].map((item) => {
                const active = statusFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatusFilter(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border transition-colors ${
                      active
                        ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-lime-400 dark:text-zinc-950 dark:border-lime-400'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Platform Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap border transition-colors ${
                  platformFilter === 'all'
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700'
                    : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                Semua Platform
              </button>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPlatformFilter(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap border transition-colors ${
                    platformFilter === preset.id
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700'
                      : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product List */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 text-center">
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Tidak ada produk yang cocok dengan filter saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  platformName={presetMap.get(product.input.presetId) ?? 'Custom'}
                  onLoad={onLoadProduct}
                  onDuplicate={onDuplicateProduct}
                  onCompare={(p) => setCompareProduct(p)}
                  onDelete={onDeleteProduct}
                />
              ))}
            </div>
          )}
        </>
      )}

      {compareProduct && (
        <ComparisonModal
          open={Boolean(compareProduct)}
          onClose={() => setCompareProduct(null)}
          input={compareProduct.input}
          presets={presets}
          title={`Perbandingan: ${compareProduct.name}`}
        />
      )}
    </div>
  );
};
