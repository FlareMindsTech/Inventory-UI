export function generateBarcode(sku) {
  // Real backend: POST /api/barcode/generate { sku } -> { barcode }
  // Dummy version: deterministic-looking code from SKU + short timestamp
  const suffix = Date.now().toString().slice(-6);
  return `${sku}${suffix}`;
}