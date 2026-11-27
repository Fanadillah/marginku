import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Download,
  Edit3,
  Moon,
  Plus,
  RotateCcw,
  Smartphone,
  Store,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { AppStorageSchema, MarketplacePreset } from '../types';
import { formatPercent, formatRupiah, generateId } from '../utils/format';
import { exportBackupJson, validateAndNormalizeStorage } from '../utils/storage';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Modal } from '../components/ui/Modal';
import { PercentInput } from '../components/ui/PercentInput';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface SettingsPageProps {
  data: AppStorageSchema;
  onToggleTheme: () => void;
  onSavePreset: (preset: MarketplacePreset) => void;
  onDeletePreset: (id: string) => void;
  onResetPresets: () => void;
  onRestoreData: (next: AppStorageSchema) => void;
  onClearAllData: () => void;
  onOpenHelp: () => void;
  isInstalled: boolean;
  onTriggerInstall: () => void;
  onNotify: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  data,
  onToggleTheme,
  onSavePreset,
  onDeletePreset,
  onResetPresets,
  onRestoreData,
  onClearAllData,
  onOpenHelp,
  isInstalled,
  onTriggerInstall,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingPreset, setEditingPreset] = useState<MarketplacePreset | null>(null);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [confirmClearStep, setConfirmClearStep] = useState<0 | 1 | 2>(0);

  // Preset form fields
  const [pName, setPName] = useState('');
  const [pAdmin, setPAdmin] = useState(0);
  const [pLayanan, setPLayanan] = useState(0);
  const [pAffiliate, setPAffiliate] = useState(0);
  const [pProses, setPProses] = useState(0);

  const openNewPreset = () => {
    setEditingPreset(null);
    setPName('');
    setPAdmin(0);
    setPLayanan(0);
    setPAffiliate(0);
    setPProses(0);
    setShowPresetModal(true);
  };

  const openEditPreset = (preset: MarketplacePreset) => {
    setEditingPreset(preset);
    setPName(preset.name);
    setPAdmin(preset.adminPercent);
    setPLayanan(preset.layananPercent);
    setPAffiliate(preset.affiliatePercent);
    setPProses(preset.biayaProses);
    setShowPresetModal(true);
  };

  const handleSavePresetForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    const preset: MarketplacePreset = {
      id: editingPreset?.id ?? generateId('preset'),
      name: pName.trim(),
      adminPercent: pAdmin,
      layananPercent: pLayanan,
      affiliatePercent: pAffiliate,
      biayaProses: pProses,
      isDefault: editingPreset?.isDefault ?? false,
    };
    onSavePreset(preset);
    setShowPresetModal(false);
  };

  const handleBackup = () => {
    exportBackupJson(data);
    onNotify('File backup JSON berhasil diunduh', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const validated = validateAndNormalizeStorage(parsed);
        onRestoreData(validated);
        onNotify('Data berhasil dipulihkan dari backup', 'success');
      } catch {
        onNotify('File backup tidak valid atau rusak', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
          Pengaturan & Data
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Atur potongan marketplace, tampilan, dan cadangan data Anda
        </p>
      </div>

      {/* Help & Tutorial Card */}
      <button
        type="button"
        onClick={onOpenHelp}
        className="w-full flex items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 text-left text-white hover:bg-zinc-900 dark:hover:bg-zinc-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lime-400 text-zinc-950 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Panduan & Tutorial Lengkap</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pelajari cara hitung, fungsi tiap menu, dan kamus istilah
            </p>
          </div>
        </div>
      </button>

      {/* Appearance */}
      <section className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              {data.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Mode Tampilan</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Saat ini: {data.theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Ganti ke {data.theme === 'dark' ? 'Terang' : 'Gelap'}
          </button>
        </div>
      </section>

      {/* Marketplace Presets */}
      <section className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Preset Marketplace
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sesuaikan jika tarif admin berubah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openNewPreset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-[11px] font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        <div className="space-y-2">
          {data.presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50 truncate">
                  {preset.name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums mt-0.5">
                  Admin {formatPercent(preset.adminPercent)} · Layanan{' '}
                  {formatPercent(preset.layananPercent)} · Aff{' '}
                  {formatPercent(preset.affiliatePercent)} · Proses{' '}
                  {formatRupiah(preset.biayaProses)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditPreset(preset)}
                  aria-label={`Edit ${preset.name}`}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {data.presets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeletePreset(preset.id)}
                    aria-label={`Hapus ${preset.name}`}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onResetPresets}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kembalikan Preset ke Bawaan</span>
        </button>
      </section>

      {/* Data Backup & Restore */}
      <section className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
            Keamanan & Cadangan Data
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            Seluruh data tersimpan langsung di perangkat Anda tanpa server. Lakukan backup berkala sebelum ganti HP atau hapus cache browser.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleBackup}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Backup (.json)</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Restore (.json)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 2-Step Danger Zone */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {confirmClearStep === 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Data Aplikasi</span>
            </button>
          )}
          {confirmClearStep === 1 && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Yakin ingin menghapus semua produk & resep?</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearStep(0)}
                  className="flex-1 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearStep(2)}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </div>
          )}
          {confirmClearStep === 2 && (
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 space-y-2">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                Konfirmasi Terakhir: Data yang dihapus tidak dapat dikembalikan kecuali Anda punya file backup.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearStep(0)}
                  className="flex-1 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setConfirmClearStep(0);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PWA Install Button Card */}
      <section className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Install Aplikasi (PWA)
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Pasang di layar utama HP agar lebih cepat & bisa dipakai offline
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>MarginKu Sudah Terinstall di Perangkat Ini</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onTriggerInstall}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Install Aplikasi MarginKu</span>
          </button>
        )}
      </section>

      {/* Edit/Add Preset Modal */}
      <Modal
        open={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        title={editingPreset ? `Edit Preset: ${editingPreset.name}` : 'Tambah Platform Baru'}
        subtitle="Atur persentase potongan default untuk platform ini"
      >
        <form onSubmit={handleSavePresetForm} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Platform
            </label>
            <input
              type="text"
              required
              autoFocus
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              placeholder="Misal: Lazada, Blibli, Reseller"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-lime-400/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <PercentInput label="Admin (%)" value={pAdmin} onChange={setPAdmin} />
            <PercentInput label="Layanan / XTRA (%)" value={pLayanan} onChange={setPLayanan} />
            <PercentInput label="Affiliate (%)" value={pAffiliate} onChange={setPAffiliate} />
            <CurrencyInput label="Biaya Proses (Rp)" value={pProses} onChange={setPProses} />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors mt-2"
          >
            Simpan Preset
          </button>
        </form>
      </Modal>
    </div>
  );
};
