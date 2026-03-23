import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Крон-ендпоінт: перевіряє всі PROCESSING ордери і оновлює статуси.
 */
export async function GET() {
  try {
    const processingOrders = await db.order.findMany({
      where: { status: "PROCESSING" },
    });

    if (!processingOrders.length) {
      return NextResponse.json({ ok: true, message: "No orders to check." });
    }

    console.log(`🔍 Checking ${processingOrders.length} orders...`);

    const results: any[] = [];

    for (const order of processingOrders) {
      try {
        const statusData = await getCardServStatus(order.orderMerchantId!, order.currency);

        await db.order.update({
          where: { id: order.id },
          data: {
            status: statusData.orderState,
            response: statusData.raw,
          },
        });

        if (statusData.orderState === "APPROVED" && !order.tokensCredited) {
          const user = await db.user.findUnique({
            where: { email: order.userEmail },
          });

          if (user) {
            const newBalance = user.tokenBalance + (order.tokens ?? 0);

            await db.user.update({
              where: { id: user.id },
              data: { tokenBalance: newBalance },
            });

            await db.ledgerEntry.create({
              data: {
                userId: user.id,
                type: "Top-up",
                delta: order.tokens ?? 0,
                balanceAfter: newBalance,
                currency: user.currency,
                amount: Math.round(order.amount * 100),
              },
            });

            await db.order.update({
              where: { id: order.id },
              data: { tokensCredited: true },
            });

            console.log(`💰 User ${user.email} balance updated: +${order.tokens} tokens`);

            // Send payment receipt email
            try {
              const sym = order.currency === "GBP" ? "£" : order.currency === "EUR" ? "€" : "$";
              await resend.emails.send({
                from: `Invoicerly <${process.env.EMAIL_FROM || "info@invoicerly.co.uk"}>`,
                to: user.email!,
                subject: `Payment receipt — ${sym}${order.amount.toFixed(2)} ${order.currency}`,
                html: `
                  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
                    <h2>Payment received ✅</h2>
                    <p>Hi ${user.name || "there"},</p>
                    <p>We've received your payment and credited <strong>${order.tokens} tokens</strong> to your account.</p>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                      <tr><td style="padding:6px 0;color:#666;">Amount</td><td style="padding:6px 0;text-align:right;font-weight:600;">${sym}${order.amount.toFixed(2)} ${order.currency}</td></tr>
                      <tr><td style="padding:6px 0;color:#666;">Tokens added</td><td style="padding:6px 0;text-align:right;font-weight:600;">${order.tokens}</td></tr>
                      <tr><td style="padding:6px 0;color:#666;">New balance</td><td style="padding:6px 0;text-align:right;font-weight:600;">${newBalance} tokens</td></tr>
                    </table>
                    <p style="color:#666;font-size:13px;">Thank you for using Invoicerly!</p>
                  </div>`,
              });
              console.log(`📧 Payment receipt sent to ${user.email}`);
            } catch (emailErr) {
              console.error("⚠️ Failed to send receipt email:", emailErr);
            }
          }
        }

        results.push({
          id: order.id,
          status: statusData.orderState,
        });
      } catch (err: any) {
        console.error(`❌ Error checking order ${order.id}:`, err.message);
      }
    }

    return NextResponse.json({
      ok: true,
      checked: processingOrders.length,
      results,
    });
  } catch (err: any) {
    console.error("❌ check-orders cron error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
