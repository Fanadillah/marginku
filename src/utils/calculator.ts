import {
  CalculationInput,
  CalculationResult,
  HealthStatus,
  IngredientItem,
  MarketplacePreset,
  RoundingMode,
} from '../types';

function clampNonNegative(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function getHealthStatus(netProfit: number, netMarginPercent: number): HealthStatus {
  if (netProfit <= 0) return 'boncos';
  if (netMarginPercent < 15) return 'tipis';
  if (netMarginPercent < 30) return 'sehat';
  return 'tebal';
}

export function applySmartRounding(rawPrice: number, mode: RoundingMode): number {
  const safePrice = clampNonNegative(rawPrice);
  if (safePrice === 0) return 0;

  switch (mode) {
    case '500':
      return Math.ceil(safePrice / 500) * 500;
    case '1000':
      return Math.ceil(safePrice / 1000) * 1000;
    case '900':
      return Math.max(900, Math.ceil((safePrice + 100) / 1000) * 1000 - 100);
    case 'none':
    default:
      return Math.ceil(safePrice);
  }
}

export function computeForward(
  sellingPrice: number,
  totalHpp: number,
  totalFeePercent: number,
  totalFixedFee: number
): CalculationResult {
  const safePrice = clampNonNegative(sellingPrice);
  const marketplacePercentFeeRp = safePrice * (totalFeePercent / 100);
  const totalMarketplaceFeeRp = marketplacePercentFeeRp + totalFixedFee;
  const netPayout = safePrice - totalMarketplaceFeeRp;
  const netProfit = netPayout - totalHpp;
  const netMarginPercent = safePrice > 0 ? (netProfit / safePrice) * 100 : 0;
  const roiPercent = totalHpp > 0 ? (netProfit / totalHpp) * 100 : 0;

  return {
    isValid: true,
    totalHpp,
    totalFeePercent,
    totalFixedFee,
    finalSellingPrice: safePrice,
    marketplacePercentFeeRp,
    totalMarketplaceFeeRp,
    netPayout,
    netProfit,
    netMarginPercent,
    roiPercent,
    healthStatus: getHealthStatus(netProfit, netMarginPercent),
  };
}

export function calculateMargin(input: CalculationInput): CalculationResult {
  const modalProduk = clampNonNegative(input.modalProduk);
  const biayaKemasan = clampNonNegative(input.biayaKemasan);
  const biayaOperasionalLain = clampNonNegative(input.biayaOperasionalLain);
  const totalHpp = modalProduk + biayaKemasan + biayaOperasionalLain;

  const adminPercent = clampNonNegative(input.adminPercent);
  const layananPercent = clampNonNegative(input.layananPercent);
  const affiliatePercent = clampNonNegative(input.affiliatePercent);
  const voucherPercent = clampNonNegative(input.voucherPercent);
  const totalFeePercent = adminPercent + layananPercent + affiliatePercent + voucherPercent;

  const biayaProses = clampNonNegative(input.biayaProses);
  const voucherNominal = clampNonNegative(input.voucherNominal);
  const biayaIklanPerUnit = clampNonNegative(input.biayaIklanPerUnit);
  const totalFixedFee = biayaProses + voucherNominal + biayaIklanPerUnit;

  if (input.mode === 'forward') {
    return computeForward(input.sellingPrice, totalHpp, totalFeePercent, totalFixedFee);
  }

  // Reverse calculation
  let rawSellingPrice = 0;

  if (input.reverseTargetType === 'nominal') {
    const denominator = 1 - totalFeePercent / 100;
    if (denominator <= 0) {
      return {
        isValid: false,
        errorMessage: 'Total potongan persentase tidak boleh 100% atau lebih.',
        totalHpp,
        totalFeePercent,
        totalFixedFee,
        finalSellingPrice: 0,
        marketplacePercentFeeRp: 0,
        totalMarketplaceFeeRp: totalFixedFee,
        netPayout: 0,
        netProfit: 0,
        netMarginPercent: 0,
        roiPercent: 0,
        healthStatus: 'boncos',
      };
    }
    const targetProfitRp = clampNonNegative(input.targetProfitRp);
    rawSellingPrice = (totalHpp + totalFixedFee + targetProfitRp) / denominator;
  } else {
    const targetMarginPercent = clampNonNegative(input.targetMarginPercent);
    const denominator = 1 - (totalFeePercent + targetMarginPercent) / 100;
    if (denominator <= 0) {
      return {
        isValid: false,
        errorMessage: 'Gabungan potongan % dan target margin % tidak boleh 100% atau lebih.',
        totalHpp,
        totalFeePercent,
        totalFixedFee,
        finalSellingPrice: 0,
        marketplacePercentFeeRp: 0,
        totalMarketplaceFeeRp: totalFixedFee,
        netPayout: 0,
        netProfit: 0,
        netMarginPercent: 0,
        roiPercent: 0,
        healthStatus: 'boncos',
      };
    }
    rawSellingPrice = (totalHpp + totalFixedFee) / denominator;
  }

  const roundedPrice = applySmartRounding(rawSellingPrice, input.roundingMode);
  return computeForward(roundedPrice, totalHpp, totalFeePercent, totalFixedFee);
}

export function calculateIngredientCost(item: IngredientItem): number {
  const pkgPrice = clampNonNegative(item.packagePrice);
  const pkgQty = clampNonNegative(item.packageQty);
  const usedQty = clampNonNegative(item.usedQty);
  if (pkgQty <= 0) return 0;
  return (pkgPrice / pkgQty) * usedQty;
}

export function calculateRecipeBatch(
  ingredients: IngredientItem[],
  extraBatchCost: number,
  yieldQty: number
): { totalIngredientsCost: number; totalBatchCost: number; hppPerUnit: number } {
  const totalIngredientsCost = ingredients.reduce(
    (sum, item) => sum + calculateIngredientCost(item),
    0
  );
  const totalBatchCost = totalIngredientsCost + clampNonNegative(extraBatchCost);
  const safeYield = clampNonNegative(yieldQty);
  const hppPerUnit = safeYield > 0 ? totalBatchCost / safeYield : 0;

  return {
    totalIngredientsCost,
    totalBatchCost,
    hppPerUnit,
  };
}

export interface BepResult {
  bepUnitsPerMonth: number | null;
  targetUnitsPerMonth: number | null;
  targetUnitsPerDay: number | null;
  estimatedMonthlyRevenue: number | null;
}

export function calculateBep(
  netProfitPerUnit: number,
  sellingPricePerUnit: number,
  biayaTetapBulanan: number,
  targetProfitBulanan: number
): BepResult {
  if (netProfitPerUnit <= 0) {
    return {
      bepUnitsPerMonth: null,
      targetUnitsPerMonth: null,
      targetUnitsPerDay: null,
      estimatedMonthlyRevenue: null,
    };
  }
  const fixedCost = clampNonNegative(biayaTetapBulanan);
  const targetProfit = clampNonNegative(targetProfitBulanan);

  const bepUnitsPerMonth = Math.ceil(fixedCost / netProfitPerUnit);
  const targetUnitsPerMonth = Math.ceil((fixedCost + targetProfit) / netProfitPerUnit);
  const targetUnitsPerDay = targetUnitsPerMonth > 0 ? Math.ceil(targetUnitsPerMonth / 30) : 0;
  const estimatedMonthlyRevenue = targetUnitsPerMonth * clampNonNegative(sellingPricePerUnit);

  return {
    bepUnitsPerMonth,
    targetUnitsPerMonth,
    targetUnitsPerDay,
    estimatedMonthlyRevenue,
  };
}

export function createDefaultCalculationInput(preset: MarketplacePreset): CalculationInput {
  return {
    mode: 'forward',
    presetId: preset.id,
    modalProduk: 0,
    biayaKemasan: 0,
    biayaOperasionalLain: 0,
    adminPercent: preset.adminPercent,
    layananPercent: preset.layananPercent,
    affiliatePercent: preset.affiliatePercent,
    voucherPercent: 0,
    voucherNominal: 0,
    biayaProses: preset.biayaProses,
    biayaIklanPerUnit: 0,
    sellingPrice: 0,
    reverseTargetType: 'nominal',
    targetProfitRp: 10000,
    targetMarginPercent: 25,
    roundingMode: '900',
  };
}
