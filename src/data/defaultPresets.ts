import { MarketplacePreset } from '../types';

export const APP_NAME = 'MarginKu';

export const DEFAULT_PRESETS: MarketplacePreset[] = [
  {
    id: 'shopee',
    name: 'Shopee',
    adminPercent: 8,
    layananPercent: 4,
    affiliatePercent: 0,
    biayaProses: 1250,
    isDefault: true,
  },
  {
    id: 'tiktok-tokopedia',
    name: 'TikTok / Tokped',
    adminPercent: 6.5,
    layananPercent: 4,
    affiliatePercent: 5,
    biayaProses: 1250,
    isDefault: true,
  },
  {
    id: 'gofood-grabfood',
    name: 'GoFood / Grab',
    adminPercent: 20,
    layananPercent: 0,
    affiliatePercent: 0,
    biayaProses: 1000,
    isDefault: true,
  },
  {
    id: 'offline-wa',
    name: 'Offline / WA',
    adminPercent: 0,
    layananPercent: 0,
    affiliatePercent: 0,
    biayaProses: 0,
    isDefault: true,
  },
];
