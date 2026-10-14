const safeInteger = (value, minimum = 0) => { const numeric = Number(value); return Number.isFinite(numeric) ? Math.max(minimum, Math.round(numeric)) : minimum; };
const marginAmount = (revenueCents, margin) => Math.round(revenueCents * margin);
export function calculateEstimate(calibrationCount, safetyOperationCount, pricing) {
  const calibrations = safeInteger(calibrationCount); const safetyOperations = safeInteger(safetyOperationCount);
  const calibrationRevenue = calibrations * pricing.calibrationRevenueCents; const safetyRevenue = safetyOperations * pricing.safetyOperationRevenueCents;
  const calibrationProfit = marginAmount(calibrationRevenue, pricing.calibrationMargin); const safetyProfit = marginAmount(safetyRevenue, pricing.safetyOperationMargin);
  const totalRevenue = calibrationRevenue + safetyRevenue; const totalProfit = calibrationProfit + safetyProfit;
  return Object.freeze({ calibrations, safetyOperations, calibrationRevenue, safetyRevenue, totalRevenue, calibrationProfit, safetyProfit, totalProfit, estimatedServiceCost: totalRevenue - totalProfit });
}
export function calculateProjections(estimate, monthlyRepairOrders) { const volume = safeInteger(monthlyRepairOrders, 1); const monthlyRevenue = estimate.totalRevenue * volume; const monthlyProfit = estimate.totalProfit * volume; return Object.freeze({ volume, monthlyRevenue, monthlyProfit, annualRevenue: monthlyRevenue * 12, annualProfit: monthlyProfit * 12 }); }
export function formatCurrency(cents) { const safeCents = Number.isFinite(Number(cents)) ? Math.round(Number(cents)) : 0; return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(safeCents / 100); }
