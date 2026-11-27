import React from 'react';
import { Calculator, ChefHat, Package, Settings } from 'lucide-react';
import { AppTab } from '../../types';

interface BottomNavProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
  productCount: number;
  recipeCount: number;
}

const NAV_ITEMS: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'calculator', label: 'Hitung', icon: Calculator },
  { id: 'recipes', label: 'Bahan', icon: ChefHat },
  { id: 'products', label: 'Produk', icon: Package },
  { id: 'settings', label: 'Atur', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChange,
  productCount,
  recipeCount,
}) => {
  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe"
    >
      <div className="grid grid-cols-4 px-2 pt-1.5 pb-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge =
            item.id === 'products' && productCount > 0
              ? productCount
              : item.id === 'recipes' && recipeCount > 0
                ? recipeCount
                : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-zinc-950 dark:text-lime-400'
                  : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums ${
                      isActive
                        ? 'bg-zinc-950 text-white dark:bg-lime-400 dark:text-zinc-950'
                        : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
