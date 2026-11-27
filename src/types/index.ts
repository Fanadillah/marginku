export type RoundingMode = 'none' | '500' | '1000' | '900';
export type CalcMode = 'forward' | 'reverse';
export type ReverseTargetType = 'nominal' | 'percent';
export type HealthStatus = 'boncos' | 'tipis' | 'sehat' | 'tebal';
export type AppTab = 'calculator' | 'recipes' | 'products' | 'settings';

export interface MarketplacePreset {
  id: string;
  name: string;
  adminPercent: number;
  layananPercent: number;
  affiliatePercent: number;
  biayaProses: number;
  isDefault?: boolean;
}

export interface CalculationInput {
  mode: CalcMode;
  presetId: string;
  // HPP
  modalProduk: number;
  biayaKemasan: number;
  biayaOperasionalLain: number;
  // Marketplace Fees
  adminPercent: number;
  layananPercent: number;
  affiliatePercent: number;
  voucherPercent: number;
  voucherNominal: number;
  biayaProses: number;
  biayaIklanPerUnit: number;
  // Forward / Reverse targets
  sellingPrice: number;
  reverseTargetType: ReverseTargetType;
  targetProfitRp: number;
  targetMarginPercent: number;
  roundingMode: RoundingMode;
}

export interface CalculationResult {
  isValid: boolean;
  errorMessage?: string;
  totalHpp: number;
  totalFeePercent: number;
  totalFixedFee: number;
  finalSellingPrice: number;
  marketplacePercentFeeRp: number;
  totalMarketplaceFeeRp: number;
  netPayout: number;
  netProfit: number;
  netMarginPercent: number;
  roiPercent: number;
  healthStatus: HealthStatus;
}

export interface SavedProduct {
  id: string;
  name: string;
  category?: string;
  input: CalculationInput;
  result: CalculationResult;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientItem {
  id: string;
  name: string;
  packagePrice: number;
  packageQty: number;
  unit: 'gr' | 'ml' | 'pcs';
  usedQty: number;
}

export interface SavedRecipe {
  id: string;
  name: string;
  yieldQty: number;
  extraBatchCost: number;
  ingredients: IngredientItem[];
  hppPerUnit: number;
  updatedAt: string;
}

export interface AppStorageSchema {
  version: number;
  theme: 'light' | 'dark';
  presets: MarketplacePreset[];
  products: SavedProduct[];
  recipes: SavedRecipe[];
}
