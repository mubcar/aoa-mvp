/**
 * Feature flags driven by environment variables.
 * Toggle integrations on/off without code changes.
 */
export const features = {
  // Solana Pay / USDC escrow. When false, NO crypto references anywhere.
  SOLANA_ESCROW: process.env.ENABLE_SOLANA_ESCROW === "true",
  // Future: PIX payments
  PIX: process.env.ENABLE_PIX === "true",
};

/**
 * Returns the active payment mode: 'solana' | 'pix' | 'none'
 */
export function getPaymentMode() {
  if (features.SOLANA_ESCROW) return "solana";
  if (features.PIX) return "pix";
  return "none";
}
