import React from 'react';
import { Award } from 'lucide-react';
import { CalculationInput, MarketplacePreset } from '../../types';
import { calculateMargin } from '../../utils/calculator';
import { formatPercent, formatRupiah } from '../../utils/format';
import { Modal } from '../ui/Modal';
import { HEALTH_CONFIG } from './ResultCard';

interface ComparisonModalProps {
  open: boolean;
  onClose: () => void;
  input: CalculationInput;
  presets: MarketplacePreset[];
  title?: string;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  open,
  onClose,
  input,
  presets,
  title = 'Bandingkan Semua Platform',
}) => {
  const rows = presets.map((preset) => {
    const simulatedInput: CalculationInput = {
      ...input,
      presetId: preset.id,
      adminPercent: preset.adminPercent,
      layananPercent: preset.layananPercent,
      affiliatePercent: preset.affiliatePercent,
      biayaProses: preset.biayaProses,
    };
    const res = calculateMargin(simulatedInput);
    return { preset, result: res };
  });

  const bestProfit = Math.max(...rows.map((r) => (r.result.isValid ? r.result.netProfit : -Infinity)));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={
        input.mode === 'forward'
          ? `Simulasi dengan harga jual sama: ${formatRupiah(input.sellingPrice)}`
          : 'Simulasi rekomendasi harga jual ideal di setiap platform'
      }
    >
      <div className="space-y-2.5">
        {rows.map(({ preset, result }) => {
          const health = HEALTH_CONFIG[result.healthStatus];
          const HealthIcon = health.icon;
          const isBest = result.isValid && result.netProfit === bestProfit && bestProfit > 0;

          return (
            <div
              key={preset.id}
              className={`p-3.5 rounded-2xl border transition-colors ${
                isBest
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">
                    {preset.name}
                  </span>
                  {isBest && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                      <Award className="w-3 h-3" />
                      Terbesar
                    </span>
                  )}
                </div>
                {result.isValid && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${health.badgeClass}`}
                  >
                    <HealthIcon className="w-3 h-3" />
                    {health.shortLabel}
                  </span>
                )}
              </div>

              {!result.isValid ? (
                <p className="text-xs text-rose-600 dark:text-rose-400">{result.errorMessage}</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/80 text-xs tabular-nums">
                  <div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Harga Jual</p>
                    <p className="font-bold text-zinc-950 dark:text-zinc-50 mt-0.5">
                      {formatRupiah(result.finalSellingPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Potongan</p>
                    <p className="font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
                      -{formatRupiah(result.totalMarketplaceFeeRp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Profit Bersih</p>
                    <p className={`font-extrabold mt-0.5 ${health.profitTextClass}`}>
                      {formatRupiah(result.netProfit, result.netProfit > 0)}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {formatPercent(result.netMarginPercent)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
