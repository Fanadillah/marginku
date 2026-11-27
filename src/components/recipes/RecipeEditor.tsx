import React, { useState } from 'react';
import { ArrowRight, Plus, Save, Trash2 } from 'lucide-react';
import { IngredientItem, SavedRecipe } from '../../types';
import { calculateIngredientCost, calculateRecipeBatch } from '../../utils/calculator';
import { formatRupiah, generateId } from '../../utils/format';
import { CurrencyInput } from '../ui/CurrencyInput';

interface RecipeEditorProps {
  initialRecipe?: SavedRecipe | null;
  onSave: (recipe: SavedRecipe) => void;
  onUseInCalculator: (hppPerUnit: number, recipeName: string) => void;
  onCancel: () => void;
}

function createEmptyIngredient(): IngredientItem {
  return {
    id: generateId('ing'),
    name: '',
    packagePrice: 0,
    packageQty: 1000,
    unit: 'gr',
    usedQty: 0,
  };
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  initialRecipe,
  onSave,
  onUseInCalculator,
  onCancel,
}) => {
  const [name, setName] = useState(initialRecipe?.name ?? '');
  const [yieldQty, setYieldQty] = useState<number>(initialRecipe?.yieldQty ?? 10);
  const [extraBatchCost, setExtraBatchCost] = useState<number>(
    initialRecipe?.extraBatchCost ?? 0
  );
  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    initialRecipe?.ingredients && initialRecipe.ingredients.length > 0
      ? initialRecipe.ingredients
      : [createEmptyIngredient()]
  );

  const summary = calculateRecipeBatch(ingredients, extraBatchCost, yieldQty);

  const updateIngredient = (id: string, patch: Partial<IngredientItem>) => {
    setIngredients((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Resep Tanpa Nama';
    const recipe: SavedRecipe = {
      id: initialRecipe?.id ?? generateId('rcp'),
      name: cleanName,
      yieldQty: Math.max(1, yieldQty),
      extraBatchCost,
      ingredients,
      hppPerUnit: Math.round(summary.hppPerUnit),
      updatedAt: new Date().toISOString(),
    };
    onSave(recipe);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Live Output Card */}
      <div className="rounded-3xl bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 p-4 text-white">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-zinc-400">Modal (HPP) per 1 Porsi / Pcs</p>
            <p className="text-3xl font-extrabold text-lime-400 tabular-nums tracking-tight mt-0.5">
              {formatRupiah(summary.hppPerUnit)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-zinc-400">Total 1 Batch</p>
            <p className="text-sm font-bold tabular-nums">{formatRupiah(summary.totalBatchCost)}</p>
          </div>
        </div>
        {summary.hppPerUnit > 0 && (
          <button
            type="button"
            onClick={() => onUseInCalculator(Math.round(summary.hppPerUnit), name.trim() || 'Resep')}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 text-xs font-bold transition-colors"
          >
            <span>Gunakan di Kalkulator Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recipe Info */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Nama Produk / Resep
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Brownies Fudgy Box / Kopi Susu 250ml"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 px-3.5 py-2.5 text-sm font-medium text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-lime-400/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Hasil Jadi per Batch
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={yieldQty === 0 ? '' : yieldQty}
              onChange={(e) => setYieldQty(Math.max(0, parseInt(e.target.value || '0', 10)))}
              placeholder="10"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 px-3.5 py-2.5 text-sm font-semibold tabular-nums text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 dark:focus:ring-lime-400/30"
            />
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Jumlah porsi/pcs dari 1x masak
            </p>
          </div>
          <CurrencyInput
            label="Gas / Listrik / Tenaga"
            hint="Biaya tambahan 1 batch"
            value={extraBatchCost}
            onChange={setExtraBatchCost}
          />
        </div>
      </div>

      {/* Ingredients List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Daftar Bahan Baku ({ingredients.length})
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Isi harga beli kemasan, berat/isi kemasan, dan takaran yang dipakai.
            </p>
          </div>
        </div>

        {ingredients.map((item, idx) => {
          const usedCost = calculateIngredientCost(item);
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0 tabular-nums">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateIngredient(item.id, { name: e.target.value })}
                  placeholder="Nama bahan (misal: Tepung Terigu)"
                  className="flex-1 min-w-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 px-3 py-1.5 text-xs font-semibold text-zinc-950 dark:text-zinc-50 placeholder:font-normal placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-lime-400"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(item.id)}
                    aria-label="Hapus bahan"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <CurrencyInput
                  compact
                  label="Harga Beli Kemasan"
                  value={item.packagePrice}
                  onChange={(val) => updateIngredient(item.id, { packagePrice: val })}
                />
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Isi Kemasan
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={item.packageQty === 0 ? '' : item.packageQty}
                      onChange={(e) =>
                        updateIngredient(item.id, {
                          packageQty: Math.max(0, parseFloat(e.target.value || '0')),
                        })
                      }
                      placeholder="1000"
                      className="w-full min-w-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 px-2.5 py-2 text-sm font-semibold tabular-nums text-zinc-950 dark:text-zinc-50 focus:outline-none focus:border-zinc-900 dark:focus:border-lime-400"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        updateIngredient(item.id, {
                          unit: e.target.value as 'gr' | 'ml' | 'pcs',
                        })
                      }
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-2 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="gr">gr</option>
                      <option value="ml">ml</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3 pt-1">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Takaran Dipakai ({item.unit})
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={item.usedQty === 0 ? '' : item.usedQty}
                    onChange={(e) =>
                      updateIngredient(item.id, {
                        usedQty: Math.max(0, parseFloat(e.target.value || '0')),
                      })
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 px-3 py-2 text-sm font-semibold tabular-nums text-zinc-950 dark:text-zinc-50 focus:outline-none focus:border-zinc-900 dark:focus:border-lime-400"
                  />
                </div>
                <div className="text-right pb-1.5 shrink-0">
                  <p className="text-[10px] text-zinc-400">Biaya Bahan</p>
                  <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50 tabular-nums">
                    {formatRupiah(usedCost)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setIngredients((prev) => [...prev, createEmptyIngredient()])}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 hover:text-zinc-950 dark:hover:border-lime-400 dark:hover:text-lime-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Baris Bahan</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Resep</span>
        </button>
      </div>
    </form>
  );
};
