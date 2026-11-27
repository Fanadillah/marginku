import { DEFAULT_PRESETS } from '../data/defaultPresets';
import { AppStorageSchema, MarketplacePreset, SavedProduct, SavedRecipe } from '../types';

const STORAGE_KEY = 'marginku_app_data_v1';
export const CURRENT_SCHEMA_VERSION = 1;

export function getInitialStorage(): AppStorageSchema {
  return {
    version: CURRENT_SCHEMA_VERSION,
    theme: 'light',
    presets: DEFAULT_PRESETS.map((p) => ({ ...p })),
    products: [],
    recipes: [],
  };
}

export function loadStorage(): AppStorageSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialStorage();
    const parsed = JSON.parse(raw) as Partial<AppStorageSchema>;
    return validateAndNormalizeStorage(parsed);
  } catch {
    return getInitialStorage();
  }
}

export function saveStorage(data: AppStorageSchema): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function validateAndNormalizeStorage(raw: unknown): AppStorageSchema {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Format file tidak valid.');
  }
  const obj = raw as Record<string, unknown>;

  const theme = obj.theme === 'dark' ? 'dark' : 'light';

  let presets: MarketplacePreset[] = DEFAULT_PRESETS.map((p) => ({ ...p }));
  if (Array.isArray(obj.presets) && obj.presets.length > 0) {
    const validPresets = obj.presets.filter(
      (p): p is MarketplacePreset =>
        Boolean(p) &&
        typeof p === 'object' &&
        typeof (p as MarketplacePreset).id === 'string' &&
        typeof (p as MarketplacePreset).name === 'string' &&
        typeof (p as MarketplacePreset).adminPercent === 'number'
    );
    if (validPresets.length > 0) {
      presets = validPresets.map((p) => ({
        id: p.id,
        name: p.name,
        adminPercent: Number(p.adminPercent) || 0,
        layananPercent: Number(p.layananPercent) || 0,
        affiliatePercent: Number(p.affiliatePercent) || 0,
        biayaProses: Number(p.biayaProses) || 0,
        isDefault: Boolean(p.isDefault),
      }));
    }
  }

  const products: SavedProduct[] = Array.isArray(obj.products)
    ? (obj.products.filter(
        (prod) =>
          Boolean(prod) &&
          typeof prod === 'object' &&
          typeof (prod as SavedProduct).id === 'string' &&
          typeof (prod as SavedProduct).name === 'string' &&
          Boolean((prod as SavedProduct).input) &&
          Boolean((prod as SavedProduct).result)
      ) as SavedProduct[])
    : [];

  const recipes: SavedRecipe[] = Array.isArray(obj.recipes)
    ? (obj.recipes.filter(
        (rec) =>
          Boolean(rec) &&
          typeof rec === 'object' &&
          typeof (rec as SavedRecipe).id === 'string' &&
          typeof (rec as SavedRecipe).name === 'string' &&
          Array.isArray((rec as SavedRecipe).ingredients)
      ) as SavedRecipe[])
    : [];

  return {
    version: CURRENT_SCHEMA_VERSION,
    theme,
    presets,
    products,
    recipes,
  };
}

export function exportBackupJson(data: AppStorageSchema): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateTag = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `marginku-backup-${dateTag}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
