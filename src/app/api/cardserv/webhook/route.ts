import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 CardServ Webhook received:", body);

    const orderMerchantId = body.orderMerchantId || body.order?.orderMerchantId;
    if (!orderMerchantId) {
      console.error("❌ Webhook missing orderMerchantId");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const existingOrder = await db.order.findFirst({ where: { orderMerchantId } });

    const statusData = await getCardServStatus(
      orderMerchantId,
      existingOrder?.orderSystemId ? String(existingOrder.orderSystemId) : undefined,
      existingOrder?.currency || "GBP"
    );

    console.log("🔹 Webhook statusData:", statusData.orderState);

    await db.order.updateMany({
      where: { orderMerchantId },
      data: {
        status: statusData.orderState,
        response: statusData.raw,
      },
    });

    if (statusData.orderState === "APPROVED") {
      const order = await db.order.findFirst({
        where: { orderMerchantId },
      });

      if (!order) {
        console.warn(`⚠️ Order ${orderMerchantId} not found in DB`);
        return NextResponse.json({ ok: false }, { status: 404 });
      }

      // Guard: skip if tokens already credited
      if (order.tokensCredited) {
        console.log(`⏭️ Tokens already credited for order ${orderMerchantId}, skipping`);
        return NextResponse.json({ ok: true, status: statusData.orderState });
      }

      const user = await db.user.findUnique({
        where: { email: order.userEmail },
      });

      if (user && order.tokens) {
        const newBalance = user.tokenBalance + order.tokens;

        await db.user.update({
          where: { id: user.id },
          data: { tokenBalance: newBalance },
        });

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

        // Mark tokens as credited so webhook/cron can never double-credit
        await db.order.update({
          where: { id: order.id },
          data: { tokensCredited: true },
        });

        console.log(`✅ Tokens credited via Webhook: +${order.tokens} to ${user.email}`);

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
                  <tr><td style="padding:6px 0;color:#666;">Order ID</td><td style="padding:6px 0;text-align:right;font-size:12px;color:#999;">${order.id}</td></tr>
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

    return NextResponse.json({ ok: true, status: statusData.orderState });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
