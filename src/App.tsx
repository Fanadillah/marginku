import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  HelpCircle,
  Moon,
  MoreVertical,
  PlusSquare,
  Share,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { APP_NAME, DEFAULT_PRESETS } from './data/defaultPresets';
import {
  AppStorageSchema,
  AppTab,
  CalculationInput,
  MarketplacePreset,
  SavedProduct,
  SavedRecipe,
} from './types';
import { calculateMargin, createDefaultCalculationInput } from './utils/calculator';
import { generateId } from './utils/format';
import { getInitialStorage, loadStorage, saveStorage } from './utils/storage';
import { BottomNav } from './components/ui/BottomNav';
import { HelpModal } from './components/ui/HelpModal';
import { Modal } from './components/ui/Modal';
import { Toast, ToastMessage } from './components/ui/Toast';
import { CalculatorPage } from './pages/CalculatorPage';
import { ProductsPage } from './pages/ProductsPage';
import { RecipesPage } from './pages/RecipesPage';
import { BeforeInstallPromptEvent, SettingsPage } from './pages/SettingsPage';

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean(nav.standalone)
  );
}

function checkIsIos(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function App() {
  const [storage, setStorage] = useState<AppStorageSchema>(() => loadStorage());
  const [activeTab, setActiveTab] = useState<AppTab>('calculator');
  const [calcInput, setCalcInput] = useState<CalculationInput>(() =>
    createDefaultCalculationInput(storage.presets[0] ?? DEFAULT_PRESETS[0])
  );
  const [editingProduct, setEditingProduct] = useState<SavedProduct | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandalone());

  const toastTimerRef = useRef<number | null>(null);

  const notify = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), text, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2600);
  }, []);

  // Persist storage to localStorage
  useEffect(() => {
    saveStorage(storage);
  }, [storage]);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (storage.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [storage.theme]);

  // Capture PWA beforeinstallprompt & appinstalled
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstallModal(false);
      notify('MarginKu berhasil diinstall ke perangkat Anda', 'success');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [notify]);

  const handleToggleTheme = () => {
    setStorage((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleTriggerInstall = async () => {
    if (isInstalled) {
      notify('MarginKu sudah terinstall di perangkat ini', 'info');
      return;
    }
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
      return;
    }
    // Fallback modal for iOS Safari or browsers that don't expose beforeinstallprompt
    setShowInstallModal(true);
  };

  // --- Product Handlers ---
  const handleSaveProduct = (name: string, category: string) => {
    const result = calculateMargin(calcInput);
    const now = new Date().toISOString();

    if (editingProduct) {
      const updated: SavedProduct = {
        ...editingProduct,
        name,
        category: category || undefined,
        input: { ...calcInput },
        result,
        updatedAt: now,
      };
      setStorage((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === updated.id ? updated : p)),
      }));
      setEditingProduct(updated);
      notify(`Produk "${name}" berhasil diperbarui`, 'success');
    } else {
      const created: SavedProduct = {
        id: generateId('prod'),
        name,
        category: category || undefined,
        input: { ...calcInput },
        result,
        createdAt: now,
        updatedAt: now,
      };
      setStorage((prev) => ({
        ...prev,
        products: [created, ...prev.products],
      }));
      setEditingProduct(created);
      notify(`Produk "${name}" berhasil disimpan`, 'success');
    }
  };

  const handleLoadProduct = (product: SavedProduct) => {
    setCalcInput({ ...product.input });
    setEditingProduct(product);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify(`Memuat "${product.name}" ke kalkulator`, 'info');
  };

  const handleDuplicateProduct = (product: SavedProduct) => {
    const now = new Date().toISOString();
    const copy: SavedProduct = {
      ...product,
      id: generateId('prod'),
      name: `${product.name} (Salinan)`,
      createdAt: now,
      updatedAt: now,
    };
    setStorage((prev) => ({
      ...prev,
      products: [copy, ...prev.products],
    }));
    notify(`"${product.name}" berhasil diduplikat`, 'success');
  };

  const handleDeleteProduct = (id: string) => {
    setStorage((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
    if (editingProduct?.id === id) {
      setEditingProduct(null);
    }
    notify('Produk dihapus dari katalog', 'info');
  };

  const handleResetCalculator = () => {
    const currentPreset =
      storage.presets.find((p) => p.id === calcInput.presetId) ??
      storage.presets[0] ??
      DEFAULT_PRESETS[0];
    setCalcInput(createDefaultCalculationInput(currentPreset));
    setEditingProduct(null);
    notify('Form kalkulator dikosongkan', 'info');
  };

  // --- Recipe Handlers ---
  const handleSaveRecipe = (recipe: SavedRecipe) => {
    setStorage((prev) => {
      const exists = prev.recipes.some((r) => r.id === recipe.id);
      return {
        ...prev,
        recipes: exists
          ? prev.recipes.map((r) => (r.id === recipe.id ? recipe : r))
          : [recipe, ...prev.recipes],
      };
    });
    notify(`Resep "${recipe.name}" tersimpan`, 'success');
  };

  const handleDeleteRecipe = (id: string) => {
    setStorage((prev) => ({
      ...prev,
      recipes: prev.recipes.filter((r) => r.id !== id),
    }));
    notify('Resep dihapus', 'info');
  };

  const handleUseRecipeInCalculator = (hppPerUnit: number, recipeName: string) => {
    setCalcInput((prev) => ({
      ...prev,
      modalProduk: Math.round(hppPerUnit),
    }));
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify(`Modal dari "${recipeName}" diisi ke kalkulator`, 'success');
  };

  // --- Preset & Data Handlers ---
  const handleSavePreset = (preset: MarketplacePreset) => {
    setStorage((prev) => {
      const exists = prev.presets.some((p) => p.id === preset.id);
      return {
        ...prev,
        presets: exists
          ? prev.presets.map((p) => (p.id === preset.id ? preset : p))
          : [...prev.presets, preset],
      };
    });
    // Sync active calculator if currently using that preset
    if (calcInput.presetId === preset.id) {
      setCalcInput((prev) => ({
        ...prev,
        adminPercent: preset.adminPercent,
        layananPercent: preset.layananPercent,
        affiliatePercent: preset.affiliatePercent,
        biayaProses: preset.biayaProses,
      }));
    }
    notify(`Preset "${preset.name}" disimpan`, 'success');
  };

  const handleDeletePreset = (id: string) => {
    setStorage((prev) => ({
      ...prev,
      presets: prev.presets.filter((p) => p.id !== id),
    }));
    notify('Preset platform dihapus', 'info');
  };

  const handleResetPresets = () => {
    const freshPresets = DEFAULT_PRESETS.map((p) => ({ ...p }));
    setStorage((prev) => ({
      ...prev,
      presets: freshPresets,
    }));
    notify('Preset dikembalikan ke angka bawaan', 'info');
  };

  const handleRestoreData = (next: AppStorageSchema) => {
    setStorage(next);
    setEditingProduct(null);
  };

  const handleClearAllData = () => {
    const fresh = getInitialStorage();
    setStorage({ ...fresh, theme: storage.theme });
    setCalcInput(createDefaultCalculationInput(fresh.presets[0]));
    setEditingProduct(null);
    notify('Seluruh data berhasil dihapus', 'info');
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-zinc-50 dark:bg-zinc-950 border-x border-zinc-200/80 dark:border-zinc-900 shadow-xl flex flex-col">
        {/* Top Minimalist Header */}
        <header className="sticky top-0 z-30 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-lime-400 text-lime-400 dark:text-zinc-950 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-none">
                {APP_NAME}
              </span>
              <span className="block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Kalkulator HPP & Margin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isInstalled && (
              <button
                type="button"
                onClick={handleTriggerInstall}
                aria-label="Install aplikasi MarginKu"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={storage.theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
            >
              {storage.theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              aria-label="Buka panduan dan tutorial"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Bantuan & Tutorial"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 pt-4 pb-24">
          {activeTab === 'calculator' && (
            <CalculatorPage
              input={calcInput}
              onChangeInput={setCalcInput}
              editingProduct={editingProduct}
              onClearEditing={() => setEditingProduct(null)}
              presets={storage.presets}
              recipes={storage.recipes}
              onSaveProduct={handleSaveProduct}
              onResetForm={handleResetCalculator}
              onOpenHelp={() => setShowHelp(true)}
            />
          )}

          {activeTab === 'recipes' && (
            <RecipesPage
              recipes={storage.recipes}
              onSaveRecipe={handleSaveRecipe}
              onDeleteRecipe={handleDeleteRecipe}
              onUseRecipeInCalculator={handleUseRecipeInCalculator}
            />
          )}

          {activeTab === 'products' && (
            <ProductsPage
              products={storage.products}
              presets={storage.presets}
              onLoadProduct={handleLoadProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onDeleteProduct={handleDeleteProduct}
              onExportDone={() => notify('File CSV Excel berhasil diunduh', 'success')}
              onGoCalculator={() => setActiveTab('calculator')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              data={storage}
              onToggleTheme={handleToggleTheme}
              onSavePreset={handleSavePreset}
              onDeletePreset={handleDeletePreset}
              onResetPresets={handleResetPresets}
              onRestoreData={handleRestoreData}
              onClearAllData={handleClearAllData}
              onOpenHelp={() => setShowHelp(true)}
              isInstalled={isInstalled}
              onTriggerInstall={handleTriggerInstall}
              onNotify={notify}
            />
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }}
          productCount={storage.products.length}
          recipeCount={storage.recipes.length}
        />

        {/* Help & Tutorial Modal */}
        <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

        {/* Fallback Install Guide Modal (for iOS Safari / unsupported browsers) */}
        <Modal
          open={showInstallModal}
          onClose={() => setShowInstallModal(false)}
          title="Install MarginKu ke HP"
          subtitle="Bisa dibuka seperti aplikasi biasa dan tetap jalan tanpa internet"
        >
          <div className="space-y-3">
            {checkIsIos() ? (
              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                <p className="text-zinc-500 dark:text-zinc-400">
                  Browser Safari di iPhone/iPad membutuhkan 2 ketukan singkat:
                </p>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-950 dark:text-zinc-50">
                      1. Ketuk tombol Bagikan (Share)
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Ada di bar bagian bawah browser Safari Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-950 dark:text-zinc-50">
                      2. Pilih Tambahkan ke Layar Utama
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Lalu ketuk <strong>Tambah</strong> di pojok kanan atas.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                <p className="text-zinc-500 dark:text-zinc-400">
                  Browser Anda belum menampilkan pop-up install otomatis. Anda bisa install cepat lewat:
                </p>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <div className="w-7 h-7 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-950 dark:text-zinc-50">
                      Buka di Chrome / Edge lalu pilih Install
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Ketuk ikon menu browser di pojok kanan atas, lalu pilih <strong>Install Aplikasi</strong> atau <strong>Tambahkan ke Layar Utama</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Pastikan halaman dibuka lewat HTTPS atau Chrome agar tombol install langsung aktif.</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold"
            >
              Mengerti
            </button>
          </div>
        </Modal>

        {/* Toast Notification */}
        <Toast toast={toast} />
      </div>
    </div>
  );
}

export default App;
