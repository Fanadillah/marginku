import React, { useState } from 'react';
import { AlertCircle, Calendar, Target, TrendingUp } from 'lucide-react';
import { calculateBep } from '../../utils/calculator';
import { formatNumber, formatRupiah } from '../../utils/format';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Modal } from '../ui/Modal';

interface BepModalProps {
  open: boolean;
  onClose: () => void;
  netProfitPerUnit: number;
  sellingPricePerUnit: number;
}

export const BepModal: React.FC<BepModalProps> = ({
  open,
  onClose,
  netProfitPerUnit,
  sellingPricePerUnit,
}) => {
  const [biayaTetap, setBiayaTetap] = useState<number>(1500000);
  const [targetProfit, setTargetProfit] = useState<number>(5000000);

  const bep = calculateBep(netProfitPerUnit, sellingPricePerUnit, biayaTetap, targetProfit);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Simulasi Target Bulanan & BEP"
      subtitle="Hitung berapa pcs yang harus terjual tiap hari agar balik modal dan capai target untung"
    >
      <div className="space-y-4">
        {/* Current Unit Profit Summary */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Profit Bersih per Pcs</span>
          <span
            className={`text-sm font-extrabold tabular-nums ${
              netProfitPerUnit > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(netProfitPerUnit)}
          </span>
        </div>

        {netProfitPerUnit <= 0 ? (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Profit per produk saat ini masih 0 atau rugi. Naikkan harga jual atau kurangi biaya terlebih dahulu untuk menghitung target bulanan.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <CurrencyInput
                id="bep-fixed"
                label="Biaya Tetap Bulanan"
                hint="Contoh: sewa tempat, internet, listrik, gaji admin per bulan (isi 0 jika jualan dari rumah tanpa biaya tetap)."
                value={biayaTetap}
                onChange={setBiayaTetap}
              />
              <CurrencyInput
                id="bep-target"
                label="Target Penghasilan Bersih / Bulan"
                hint="Jumlah untung bersih yang ingin Anda bawa pulang setiap bulan."
                value={targetProfit}
                onChange={setTargetProfit}
              />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-80">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target / Hari</span>
                </div>
                <p className="text-2xl font-extrabold tabular-nums mt-1">
                  {formatNumber(bep.targetUnitsPerDay ?? 0)}
                  <span className="text-xs font-semibold ml-1">pcs</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  <Target className="w-3.5 h-3.5" />
                  <span>Target / Bulan</span>
                </div>
                <p className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tabular-nums mt-1">
                  {formatNumber(bep.targetUnitsPerMonth ?? 0)}
                  <span className="text-xs font-semibold text-zinc-500 ml-1">pcs</span>
                </p>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Minimal Balik Modal (BEP)
                </span>
                <span className="font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">
                  {formatNumber(bep.bepUnitsPerMonth ?? 0)} pcs / bulan
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Estimasi Omzet Bulanan
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatRupiah(bep.estimatedMonthlyRevenue ?? 0)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
