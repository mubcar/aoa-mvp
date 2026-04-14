import { supabase } from "../config/supabase.js";
import { generateDepositLink } from "../services/solana-pay.js";

// Default deposit amounts by urgency (in USDC)
const DEPOSIT_AMOUNTS = {
  emergency: 50,
  high: 30,
  medium: 20,
  low: 15,
};

export async function paymentsRoutes(app) {
  // Generate a Solana Pay deposit link for a lead
  app.post("/create-deposit", async (request, reply) => {
    const { leadId, amount } = request.body;

    // Get the lead
    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (error || !lead) {
      return reply.status(404).send({ error: "Lead not found" });
    }

    if (lead.solana_pay_url) {
      return reply.status(200).send({
        url: lead.solana_pay_url,
        message: "Deposit link already generated",
      });
    }

    const merchantWallet = process.env.SOLANA_MERCHANT_WALLET;
    if (!merchantWallet) {
      return reply.status(500).send({ error: "Merchant wallet not configured" });
    }

    const depositAmount = amount || DEPOSIT_AMOUNTS[lead.urgency] || 20;

    const deposit = generateDepositLink({
      merchantWallet,
      amount: depositAmount,
      leadId: lead.id,
      businessName: "ClimaTech Refrigeração",
    });

    // Save deposit info to lead
    await supabase
      .from("leads")
      .update({
        deposit_amount_usdc: deposit.amount,
        solana_pay_url: deposit.url,
        status: "deposit_sent",
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    return {
      url: deposit.url,
      amount: deposit.amount,
      reference: deposit.reference,
    };
  });

  // Manually confirm a deposit (for demo purposes)
  app.post("/confirm-deposit", async (request, reply) => {
    const { leadId, txSignature } = request.body;

    const { data, error } = await supabase
      .from("leads")
      .update({
        status: "deposit_paid",
        solana_tx_signature: txSignature || "demo-confirmed",
        deposit_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });
}
