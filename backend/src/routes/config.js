import { features, getPaymentMode } from "../config/features.js";

export async function configRoutes(app) {
  // Public: frontend reads this to conditionally render payment UI
  app.get("/features", async () => ({
    solanaEscrow: features.SOLANA_ESCROW,
    paymentMode: getPaymentMode(),
  }));
}
