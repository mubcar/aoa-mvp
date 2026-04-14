import { PublicKey, Keypair } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import bs58 from "bs58";

const USDC_MINT = new PublicKey(
  process.env.USDC_MINT_ADDRESS || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

/**
 * Generate a Solana Pay URL for a USDC deposit
 *
 * Solana Pay URL format:
 * solana:<recipient>?amount=<amount>&spl-token=<mint>&reference=<reference>&label=<label>&message=<message>
 */
export function generateDepositLink({ merchantWallet, amount, leadId, businessName }) {
  const recipient = new PublicKey(merchantWallet);

  // Generate a unique reference key for tracking this payment
  const reference = Keypair.generate().publicKey;

  const params = new URLSearchParams();
  params.set("amount", new BigNumber(amount).toString());
  params.set("spl-token", USDC_MINT.toBase58());
  params.set("reference", reference.toBase58());
  params.set("label", businessName);
  params.set("message", `Depósito de serviço — Lead ${leadId.slice(0, 8)}`);

  const url = `solana:${recipient.toBase58()}?${params.toString()}`;

  return {
    url,
    reference: reference.toBase58(),
    amount,
  };
}
