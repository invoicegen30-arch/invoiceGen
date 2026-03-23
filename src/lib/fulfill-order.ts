import { db } from "@/lib/db";
import { generatePaymentReceiptPDF } from "@/lib/payment-receipt-pdf";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Fulfil an approved CardServ order:
 *  1. Credit tokens to user
 *  2. Create ledger entry
 *  3. Mark order as credited
 *  4. Generate receipt PDF
 *  5. Send receipt email with PDF attached
 *
 * Returns `true` if tokens were credited (first call),
 * or `false` if they were already credited (idempotent guard).
 */
export async function fulfillApprovedOrder(orderMerchantId: string): Promise<boolean> {
  const order = await db.order.findFirst({ where: { orderMerchantId } });

  if (!order) {
    console.warn(`⚠️ fulfillApprovedOrder: order ${orderMerchantId} not found`);
    return false;
  }

  // Guard: skip if tokens already credited (idempotent)
  if (order.tokensCredited) {
    console.log(`⏭️ Tokens already credited for order ${orderMerchantId}, skipping`);
    return false;
  }

  const user = await db.user.findUnique({ where: { email: order.userEmail } });

  if (!user || !order.tokens) {
    console.warn(`⚠️ fulfillApprovedOrder: user or tokens missing for ${orderMerchantId}`);
    return false;
  }

  const newBalance = user.tokenBalance + order.tokens;

  // 1. Credit tokens
  await db.user.update({
    where: { id: user.id },
    data: { tokenBalance: newBalance },
  });

  // 2. Ledger entry
  await db.ledgerEntry.create({
    data: {
      userId: user.id,
      type: "Top-up",
      delta: order.tokens,
      balanceAfter: newBalance,
      currency: user.currency,
      amount: Math.round(order.amount * 100),
    },
  });

  // 3. Mark order as credited
  await db.order.update({
    where: { id: order.id },
    data: { tokensCredited: true },
  });

  console.log(`✅ Tokens credited: +${order.tokens} to ${user.email} (balance ${newBalance})`);

  // 4. Generate receipt PDF
  let pdfBase64: string | null = null;
  try {
    pdfBase64 = generatePaymentReceiptPDF({
      orderId: order.id,
      orderMerchantId: order.orderMerchantId!,
      userName: user.name || "Customer",
      userEmail: user.email!,
      amount: order.amount,
      currency: order.currency,
      tokens: order.tokens,
      newBalance,
      paidAt: new Date(),
    });
  } catch (pdfErr) {
    console.error("⚠️ Failed to generate payment receipt PDF:", pdfErr);
  }

  // 5. Send receipt email with PDF attached
  const sym =
    order.currency === "GBP"
      ? "£"
      : order.currency === "EUR"
        ? "€"
        : order.currency === "AUD"
          ? "A$"
          : order.currency === "CAD"
            ? "C$"
            : order.currency === "NZD"
              ? "NZ$"
              : "$";

  try {
    await resend.emails.send({
      from: `Invoicerly <${process.env.EMAIL_FROM || "info@invoicerly.co.uk"}>`,
      to: user.email!,
      subject: `Payment receipt — ${sym}${order.amount.toFixed(2)} ${order.currency}`,
      attachments: pdfBase64
        ? [
            {
              filename: `Invoicerly-Receipt-${order.id.slice(-8).toUpperCase()}.pdf`,
              content: pdfBase64,
            },
          ]
        : [],
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2>Payment received ✅</h2>
          <p>Hi ${user.name || "there"},</p>
          <p>We've received your payment and credited <strong>${order.tokens.toLocaleString()} tokens</strong> to your account.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:6px 0;color:#666;">Amount</td><td style="padding:6px 0;text-align:right;font-weight:600;">${sym}${order.amount.toFixed(2)} ${order.currency}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Tokens added</td><td style="padding:6px 0;text-align:right;font-weight:600;">${order.tokens.toLocaleString()}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">New balance</td><td style="padding:6px 0;text-align:right;font-weight:600;">${newBalance.toLocaleString()} tokens</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Order ID</td><td style="padding:6px 0;text-align:right;font-size:12px;color:#999;">${order.id}</td></tr>
          </table>
          ${pdfBase64 ? '<p style="color:#666;font-size:13px;">📎 Your payment receipt is attached as a PDF.</p>' : ""}
          <p style="color:#666;font-size:13px;">Thank you for using Invoicerly!</p>
        </div>`,
    });
    console.log(`📧 Payment receipt email sent to ${user.email}`);
  } catch (emailErr) {
    console.error("⚠️ Failed to send receipt email:", emailErr);
  }

  return true;
}

