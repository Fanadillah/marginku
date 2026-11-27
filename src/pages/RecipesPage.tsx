import React, { useState } from 'react';
import { ArrowRight, ChefHat, Edit3, Plus, Trash2 } from 'lucide-react';
import { SavedRecipe } from '../types';
import { formatDateShort, formatRupiah } from '../utils/format';
import { RecipeEditor } from '../components/recipes/RecipeEditor';

interface RecipesPageProps {
  recipes: SavedRecipe[];
  onSaveRecipe: (recipe: SavedRecipe) => void;
  onDeleteRecipe: (id: string) => void;
  onUseRecipeInCalculator: (hppPerUnit: number, recipeName: string) => void;
}

export const RecipesPage: React.FC<RecipesPageProps> = ({
  recipes,
  onSaveRecipe,
  onDeleteRecipe,
  onUseRecipeInCalculator,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  const handleStartNew = () => {
    setSelectedRecipe(null);
    setIsEditing(true);
  };

  const handleEdit = (recipe: SavedRecipe) => {
    setSelectedRecipe(recipe);
    setIsEditing(true);
  };

  const handleSave = (recipe: SavedRecipe) => {
    onSaveRecipe(recipe);
    setIsEditing(false);
    setSelectedRecipe(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
              {selectedRecipe ? 'Edit Resep HPP' : 'Buat Resep Baru'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Hitung modal bersih per porsi dari bahan baku
            </p>
          </div>
        </div>
        <RecipeEditor
          initialRecipe={selectedRecipe}
          onSave={handleSave}
          onUseInCalculator={onUseRecipeInCalculator}
          onCancel={() => {
            setIsEditing(false);
            setSelectedRecipe(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
            Kalkulator Bahan & Resep
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Hitung HPP per porsi untuk produk kuliner & handmade
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Resep Baru</span>
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-7 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto">
            <ChefHat className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Belum Ada Resep Tersimpan
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Cocok untuk jualan makanan, minuman, kue, atau kerajinan. Masukkan bahan baku sekali, lalu kirim HPP-nya ke kalkulator marketplace.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartNew}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Resep Pertama</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">
                    {recipe.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                    {recipe.ingredients.length} bahan · hasil {recipe.yieldQty} porsi ·{' '}
                    {formatDateShort(recipe.updatedAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">HPP / Porsi</p>
                  <p className="text-base font-extrabold text-zinc-950 dark:text-lime-400 tabular-nums">
                    {formatRupiah(recipe.hppPerUnit)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => onUseRecipeInCalculator(recipe.hppPerUnit, recipe.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-lime-300 transition-colors"
                >
                  <span>Pakai di Kalkulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(recipe)}
                  aria-label="Edit resep"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRecipe(recipe.id)}
                  aria-label="Hapus resep"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
