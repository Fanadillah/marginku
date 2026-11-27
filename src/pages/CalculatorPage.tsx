import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ChefHat,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Scale,
  SlidersHorizontal,
  Sparkles,
  Store,
  Target,
  Wallet,
} from 'lucide-react';
import {
  CalculationInput,
  MarketplacePreset,
  RoundingMode,
  SavedProduct,
  SavedRecipe,
} from '../types';
import { calculateMargin } from '../utils/calculator';
import { formatPercent, formatRupiah } from '../utils/format';
import { BepModal } from '../components/calculator/BepModal';
import { ComparisonModal } from '../components/calculator/ComparisonModal';
import { ResultCard } from '../components/calculator/ResultCard';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Modal } from '../components/ui/Modal';
import { PercentInput } from '../components/ui/PercentInput';

interface CalculatorPageProps {
  input: CalculationInput;
  onChangeInput: (next: CalculationInput) => void;
  editingProduct: SavedProduct | null;
  onClearEditing: () => void;
  presets: MarketplacePreset[];
  recipes: SavedRecipe[];
  onSaveProduct: (name: string, category: string) => void;
  onResetForm: () => void;
  onOpenHelp: () => void;
}

const ROUNDING_OPTIONS: { value: RoundingMode; label: string; example: string }[] = [
  { value: 'none', label: 'Tanpa', example: 'Asli' },
  { value: '500', label: 'Rp500', example: '24.500' },
  { value: '1000', label: 'Rp1.000', example: '25.000' },
  { value: '900', label: 'Akhiran 900', example: '24.900' },
];

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  input,
  onChangeInput,
  editingProduct,
  onClearEditing,
  presets,
  recipes,
  onSaveProduct,
  onResetForm,
  onOpenHelp,
}) => {
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showBep, setShowBep] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');

  const result = useMemo(() => calculateMargin(input), [input]);

  const currentPreset = presets.find((p) => p.id === input.presetId);
  const platformName = currentPreset?.name ?? 'Custom';

  const update = (patch: Partial<CalculationInput>) => {
    onChangeInput({ ...input, ...patch });
  };

  const handleSelectPreset = (preset: MarketplacePreset) => {
    update({
      presetId: preset.id,
      adminPercent: preset.adminPercent,
      layananPercent: preset.layananPercent,
      affiliatePercent: preset.affiliatePercent,
      biayaProses: preset.biayaProses,
    });
  };

  const handleOpenSave = () => {
    setProductName(editingProduct?.name ?? '');
    setProductCategory(editingProduct?.category ?? '');
    setShowSaveModal(true);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    onSaveProduct(productName.trim(), productCategory.trim());
    setShowSaveModal(false);
  };

  const handleFillExample = () => {
    const shopee = presets[0];
    onChangeInput({
      ...input,
      mode: 'forward',
      presetId: shopee?.id ?? 'shopee',
      modalProduk: 35000,
      biayaKemasan: 2500,
      biayaOperasionalLain: 0,
      adminPercent: shopee?.adminPercent ?? 8,
      layananPercent: shopee?.layananPercent ?? 4,
      affiliatePercent: shopee?.affiliatePercent ?? 0,
      voucherPercent: 0,
      voucherNominal: 0,
      biayaProses: shopee?.biayaProses ?? 1250,
      biayaIklanPerUnit: 0,
      sellingPrice: 65000,
    });
  };

  const isEmpty = input.modalProduk === 0 && input.sellingPrice === 0 && input.mode === 'forward';

  return (
    <div className="space-y-4">
      {/* Editing Banner */}
      {editingProduct && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white text-xs">
          <span className="truncate">
            Mengedit: <strong>{editingProduct.name}</strong>
          </span>
          <button
            type="button"
            onClick={onClearEditing}
            className="text-[11px] font-bold text-lime-400 hover:underline shrink-0"
          >
            Buat Baru
          </button>
        </div>
      )}

      {/* Mode Switcher (Segmented Control) */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => update({ mode: 'forward' })}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            input.mode === 'forward'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Cek Profit
          <span className="block text-[10px] font-normal opacity-75 mt-0.5">
            Saya punya harga jual
          </span>
        </button>
        <button
          type="button"
          onClick={() => update({ mode: 'reverse' })}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            input.mode === 'reverse'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Cari Harga Jual
          <span className="block text-[10px] font-normal opacity-75 mt-0.5">
            Saya punya target untung
          </span>
        </button>
      </div>

      {/* Sticky Result Summary Card */}
      <div className="sticky top-[57px] z-20">
        <ResultCard result={result} mode={input.mode} platformName={platformName} />
      </div>

      {/* Beginner Friendly Quick-Start Banner (only when empty) */}
      {isEmpty && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
              Baru pertama kali? Coba simulasi contoh atau baca panduan.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleFillExample}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-[11px] font-bold"
            >
              <Sparkles className="w-3 h-3" />
              Contoh
            </button>
            <button
              type="button"
              onClick={onOpenHelp}
              className="px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Panduan
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={handleOpenSave}
          disabled={!result.isValid || result.finalSellingPrice <= 0}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-[11px] font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors disabled:opacity-40"
        >
          <Save className="w-4 h-4" />
          <span>{editingProduct ? 'Update' : 'Simpan'}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCompare(true)}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Scale className="w-4 h-4" />
          <span>Bandingkan</span>
        </button>
        <button
          type="button"
          onClick={() => setShowBep(true)}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Target className="w-4 h-4" />
          <span>Target BEP</span>
        </button>
        <button
          type="button"
          onClick={onResetForm}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* CARD 1: MODAL / HPP */}
      <section className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                1. Modal Produk (HPP)
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Total modal: <strong className="tabular-nums text-zinc-800 dark:text-zinc-200">{formatRupiah(result.totalHpp)}</strong>
              </p>
            </div>
          </div>
          {recipes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRecipePicker(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Dari Resep</span>
            </button>
          )}
        </div>

        <CurrencyInput
          id="modal-produk"
          label="Harga Beli / Modal Produksi"
          hint="Harga kulakan dari supplier atau modal bahan per 1 pcs."
          value={input.modalProduk}
          onChange={(val) => update({ modalProduk: val })}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <CurrencyInput
            id="biaya-kemasan"
            label="Biaya Kemasan"
            hint="Bubble wrap, kardus, lakban"
            value={input.biayaKemasan}
            onChange={(val) => update({ biayaKemasan: val })}
          />
          <CurrencyInput
            id="biaya-lain"
            label="Operasional Lain"
            hint="Opsional per pcs"
            value={input.biayaOperasionalLain}
            onChange={(val) => update({ biayaOperasionalLain: val })}
          />
        </div>
      </section>

      {/* CARD 2: PLATFORM & POTONGAN */}
      <section className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              2. Platform & Potongan
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
              Total: <strong className="text-zinc-800 dark:text-zinc-200">{formatPercent(result.totalFeePercent)}</strong>
              {result.totalFixedFee > 0 && (
                <> + <strong className="text-zinc-800 dark:text-zinc-200">{formatRupiah(result.totalFixedFee)}</strong></>
              )}
            </p>
          </div>
        </div>

        {/* Preset Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {presets.map((preset) => {
            const active = input.presetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-lime-400 dark:text-zinc-950 dark:border-lime-400'
                    : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Toggle Detailed Fee Editor */}
        <button
          type="button"
          onClick={() => setShowFeeDetails((prev) => !prev)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span>Ubah Rincian Potongan & Iklan</span>
          </span>
          {showFeeDetails ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </button>

        {showFeeDetails && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <PercentInput
                id="fee-admin"
                label="Admin Kategori"
                value={input.adminPercent}
                onChange={(val) => update({ adminPercent: val })}
              />
              <PercentInput
                id="fee-layanan"
                label="Gratis Ongkir / XTRA"
                value={input.layananPercent}
                onChange={(val) => update({ layananPercent: val })}
              />
              <PercentInput
                id="fee-affiliate"
                label="Komisi Affiliate"
                value={input.affiliatePercent}
                onChange={(val) => update({ affiliatePercent: val })}
              />
              <PercentInput
                id="fee-voucher-pct"
                label="Voucher Toko (%)"
                value={input.voucherPercent}
                onChange={(val) => update({ voucherPercent: val })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <CurrencyInput
                id="fee-proses"
                label="Biaya Proses Order"
                hint="Contoh: Rp1.250"
                value={input.biayaProses}
                onChange={(val) => update({ biayaProses: val })}
              />
              <CurrencyInput
                id="fee-voucher-rp"
                label="Voucher Toko (Rp)"
                hint="Potongan nominal tetap"
                value={input.voucherNominal}
                onChange={(val) => update({ voucherNominal: val })}
              />
            </div>

            <CurrencyInput
              id="fee-ads"
              label="Estimasi Biaya Iklan / Pcs"
              hint="Perkiraan biaya iklan (CPAS / Shopee Ads) per 1 barang terjual."
              value={input.biayaIklanPerUnit}
              onChange={(val) => update({ biayaIklanPerUnit: val })}
            />
          </div>
        )}
      </section>

      {/* CARD 3: HARGA JUAL / TARGET UNTUNG */}
      <section className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              {input.mode === 'forward' ? '3. Harga Jual Anda' : '3. Target Untung Anda'}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {input.mode === 'forward'
                ? 'Masukkan harga yang ingin Anda pasang di toko'
                : 'Tentukan untung bersih yang diinginkan per pcs'}
            </p>
          </div>
        </div>

        {input.mode === 'forward' ? (
          <CurrencyInput
            id="selling-price"
            label="Harga Jual di Marketplace"
            hint="Hasil profit bersih langsung dihitung otomatis di kartu atas."
            value={input.sellingPrice}
            onChange={(val) => update({ sellingPrice: val })}
          />
        ) : (
          <div className="space-y-3.5">
            {/* Target Type Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-950">
              <button
                type="button"
                onClick={() => update({ reverseTargetType: 'nominal' })}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  input.reverseTargetType === 'nominal'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Target Rupiah (Rp)
              </button>
              <button
                type="button"
                onClick={() => update({ reverseTargetType: 'percent' })}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  input.reverseTargetType === 'percent'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Target Margin (%)
              </button>
            </div>

            {input.reverseTargetType === 'nominal' ? (
              <CurrencyInput
                id="target-profit-rp"
                label="Ingin Untung Bersih Berapa per Pcs?"
                hint="Contoh: isi 15.000 jika ingin mengantongi Rp15.000 bersih per barang."
                value={input.targetProfitRp}
                onChange={(val) => update({ targetProfitRp: val })}
              />
            ) : (
              <PercentInput
                id="target-margin-pct"
                label="Ingin Margin Bersih Berapa Persen?"
                hint="Persentase laba bersih dari harga jual (disarankan 15% - 30%)."
                value={input.targetMarginPercent}
                onChange={(val) => update({ targetMarginPercent: val })}
              />
            )}

            {/* Smart Rounding */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Pembulatan Harga Jual
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROUNDING_OPTIONS.map((opt) => {
                  const active = input.roundingMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update({ roundingMode: opt.value })}
                      className={`px-3 py-2 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-lime-400 dark:text-zinc-950 dark:border-lime-400'
                          : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <span className="block text-xs font-bold">{opt.label}</span>
                      <span className="block text-[10px] opacity-75 tabular-nums">
                        Contoh: {opt.example}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      <ComparisonModal
        open={showCompare}
        onClose={() => setShowCompare(false)}
        input={input}
        presets={presets}
      />

      <BepModal
        open={showBep}
        onClose={() => setShowBep(false)}
        netProfitPerUnit={result.isValid ? result.netProfit : 0}
        sellingPricePerUnit={result.isValid ? result.finalSellingPrice : 0}
      />

      {/* Save Product Modal */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={editingProduct ? 'Update Data Produk' : 'Simpan ke Katalog Produk'}
        subtitle="Simpan hasil hitungan agar bisa dibuka kembali atau di-export ke Excel"
      >
        <form onSubmit={handleConfirmSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              required
              autoFocus
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Misal: Kaos Oversize Cotton 24s"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-lime-400/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Kategori (Opsional)
            </label>
            <input
              type="text"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              placeholder="Misal: Fashion, Kuliner, Skincare"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-lime-400/30"
            />
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs tabular-nums">
            <span className="text-zinc-500 dark:text-zinc-400">
              {platformName} · {formatRupiah(result.finalSellingPrice)}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Profit {formatRupiah(result.netProfit)}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors"
          >
            {editingProduct ? 'Simpan Perubahan' : 'Simpan Produk'}
          </button>
        </form>
      </Modal>

      {/* Pick Recipe Modal */}
      <Modal
        open={showRecipePicker}
        onClose={() => setShowRecipePicker(false)}
        title="Ambil Modal dari Resep"
        subtitle="Pilih resep untuk otomatis mengisi Harga Beli / Modal Produksi"
      >
        <div className="space-y-2">
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => {
                update({ modalProduk: Math.round(recipe.hppPerUnit) });
                setShowRecipePicker(false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950 hover:border-zinc-900 dark:hover:border-lime-400 text-left transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">
                  {recipe.name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {recipe.ingredients.length} bahan · hasil {recipe.yieldQty} pcs
                </p>
              </div>
              <span className="text-sm font-extrabold text-zinc-950 dark:text-lime-400 tabular-nums shrink-0 ml-2">
                {formatRupiah(recipe.hppPerUnit)}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
