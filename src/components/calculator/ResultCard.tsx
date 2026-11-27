import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { CalcMode, CalculationResult, HealthStatus } from '../../types';
import { formatPercent, formatRupiah } from '../../utils/format';

interface ResultCardProps {
  result: CalculationResult;
  mode: CalcMode;
  platformName: string;
}

export const HEALTH_CONFIG: Record<
  HealthStatus,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    profitTextClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  boncos: {
    label: 'Boncos (Rugi)',
    shortLabel: 'Boncos',
    badgeClass:
      'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
    profitTextClass: 'text-rose-600 dark:text-rose-400',
    icon: XCircle,
  },
  tipis: {
    label: 'Tipis (Rawan)',
    shortLabel: 'Tipis',
    badgeClass:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900',
    profitTextClass: 'text-amber-600 dark:text-amber-400',
    icon: AlertTriangle,
  },
  sehat: {
    label: 'Sehat',
    shortLabel: 'Sehat',
    badgeClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900',
    profitTextClass: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  tebal: {
    label: 'Tebal (Optimal)',
    shortLabel: 'Tebal',
    badgeClass:
      'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 border border-emerald-700 dark:border-emerald-400',
    profitTextClass: 'text-emerald-600 dark:text-emerald-400',
    icon: TrendingUp,
  },
};

export const ResultCard: React.FC<ResultCardProps> = ({ result, mode, platformName }) => {
  const health = HEALTH_CONFIG[result.healthStatus];
  const HealthIcon = health.icon;

  // Compute percentages for visual stacked breakdown bar
  const selling = result.finalSellingPrice;
  const hasPrice = result.isValid && selling > 0;
  let hppPct = 0;
  let feePct = 0;
  let profitPct = 0;

  if (hasPrice) {
    if (result.netProfit >= 0) {
      hppPct = Math.max(0, Math.min(100, (result.totalHpp / selling) * 100));
      feePct = Math.max(0, Math.min(100 - hppPct, (result.totalMarketplaceFeeRp / selling) * 100));
      profitPct = Math.max(0, 100 - hppPct - feePct);
    } else {
      const totalCost = result.totalHpp + result.totalMarketplaceFeeRp;
      if (totalCost > 0) {
        hppPct = (result.totalHpp / totalCost) * 100;
        feePct = (result.totalMarketplaceFeeRp / totalCost) * 100;
        profitPct = 0;
      }
    }
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
      {!result.isValid ? (
        <div className="flex items-start gap-3 py-3 text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">Perhitungan Tidak Valid</p>
            <p className="text-xs mt-0.5 text-zinc-600 dark:text-zinc-400">
              {result.errorMessage}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top row: Selling price & Health badge */}
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {mode === 'reverse' ? 'Rekomendasi Harga Jual' : 'Harga Jual'} · {platformName}
              </p>
              <p className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 tabular-nums tracking-tight mt-0.5">
                {formatRupiah(result.finalSellingPrice)}
              </p>
            </div>
            {hasPrice && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${health.badgeClass}`}
              >
                <HealthIcon className="w-3.5 h-3.5" />
                <span>{health.label}</span>
              </span>
            )}
          </div>

          {/* Main Highlight: Net Profit */}
          <div className="py-3.5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Profit Bersih / Pcs
              </p>
              <p
                className={`text-3xl font-extrabold tabular-nums tracking-tight leading-tight mt-0.5 truncate ${
                  hasPrice ? health.profitTextClass : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {formatRupiah(result.netProfit, result.netProfit > 0)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Margin Bersih</p>
              <p className="text-base font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">
                {formatPercent(result.netMarginPercent)}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                ROI {formatPercent(result.roiPercent, 0)}
              </p>
            </div>
          </div>

          {/* Stacked Horizontal Cost Breakdown Bar */}
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
              {hasPrice && (
                <>
                  <div
                    style={{ width: `${hppPct}%` }}
                    className="h-full bg-zinc-400 dark:bg-zinc-500 transition-all duration-300"
                    title="Modal (HPP)"
                  />
                  <div
                    style={{ width: `${feePct}%` }}
                    className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-300"
                    title="Potongan Marketplace & Iklan"
                  />
                  {profitPct > 0 && (
                    <div
                      style={{ width: `${profitPct}%` }}
                      className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                      title="Profit Bersih"
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                Modal {formatPercent(hppPct, 0)}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />
                Potongan {formatPercent(feePct, 0)}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                Untung {formatPercent(profitPct, 0)}
              </span>
            </div>
          </div>

          {/* Bottom Strip: Payout & Total Fee */}
          <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/70 px-3 py-2 border border-zinc-100 dark:border-zinc-800/80">
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                Uang Cair ke Saldo
              </p>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50 tabular-nums mt-0.5">
                {formatRupiah(result.netPayout)}
              </p>
            </div>
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/70 px-3 py-2 border border-zinc-100 dark:border-zinc-800/80">
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                Total Potongan ({formatPercent(result.totalFeePercent)})
              </p>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums mt-0.5">
                -{formatRupiah(result.totalMarketplaceFeeRp)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
