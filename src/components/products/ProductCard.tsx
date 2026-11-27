import React from 'react';
import { Copy, Edit3, Scale, Trash2 } from 'lucide-react';
import { SavedProduct } from '../../types';
import { formatDateShort, formatPercent, formatRupiah } from '../../utils/format';
import { HEALTH_CONFIG } from '../calculator/ResultCard';

interface ProductCardProps {
  product: SavedProduct;
  platformName: string;
  onLoad: (product: SavedProduct) => void;
  onDuplicate: (product: SavedProduct) => void;
  onCompare: (product: SavedProduct) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  platformName,
  onLoad,
  onDuplicate,
  onCompare,
  onDelete,
}) => {
  const { result } = product;
  const health = HEALTH_CONFIG[result.healthStatus];
  const HealthIcon = health.icon;

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              {platformName}
            </span>
            {product.category && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                {product.category}
              </span>
            )}
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {formatDateShort(product.updatedAt)}
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${health.badgeClass}`}
        >
          <HealthIcon className="w-3 h-3" />
          {health.shortLabel}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-zinc-100 dark:border-zinc-800/80 tabular-nums">
        <div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Harga Jual</p>
          <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50 mt-0.5">
            {formatRupiah(result.finalSellingPrice)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Profit Bersih</p>
          <p className={`text-xs font-extrabold mt-0.5 ${health.profitTextClass}`}>
            {formatRupiah(result.netProfit, result.netProfit > 0)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Margin</p>
          <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50 mt-0.5">
            {formatPercent(result.netMarginPercent)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => onLoad(product)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 dark:bg-zinc-800 text-white dark:text-zinc-100 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Buka</span>
        </button>
        <button
          type="button"
          onClick={() => onCompare(product)}
          title="Bandingkan semua platform"
          aria-label="Bandingkan platform"
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Scale className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDuplicate(product)}
          title="Duplikat produk"
          aria-label="Duplikat produk"
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(product.id)}
          title="Hapus produk"
          aria-label="Hapus produk"
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
