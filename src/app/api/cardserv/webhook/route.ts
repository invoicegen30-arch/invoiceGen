import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 CardServ Webhook received:", body);

    const orderMerchantId = body.orderMerchantId || body.order?.orderMerchantId;
    if (!orderMerchantId) {
      console.error("❌ Webhook missing orderMerchantId");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // 🔹 Отримуємо актуальний статус
    const statusData = await getCardServStatus(orderMerchantId);
    console.log("🔹 Webhook statusData:", statusData.orderState);

    // 🔹 Оновлюємо статус у базі
    const order = await db.order.updateMany({
      where: { orderMerchantId },
      data: {
        status: statusData.orderState,
        response: statusData.raw,
      },
    });

    // 🔹 Якщо оплата успішна — нараховуємо токени
    if (statusData.orderState === "APPROVED") {
      const dbOrder = await db.order.findFirst({
        where: { orderMerchantId },
      });

      if (!dbOrder) {
        console.warn(`⚠️ Order ${orderMerchantId} not found in DB`);
        return NextResponse.json({ ok: false }, { status: 404 });
      }

      const user = await db.user.findUnique({
        where: { email: dbOrder.userEmail },
      });

      if (user && dbOrder.tokens) {
        const newBalance = user.tokenBalance + dbOrder.tokens;

        await db.user.update({
          where: { id: user.id },
          data: { tokenBalance: newBalance },
        });

        await db.ledgerEntry.create({
          data: {
            userId: user.id,
            type: "Top-up",
            delta: dbOrder.tokens,
            balanceAfter: newBalance,
            currency: user.currency,
            amount: Math.round(dbOrder.amount * 100),
          },
        });

        console.log(`✅ Tokens credited via Webhook: +${dbOrder.tokens} to ${user.email}`);
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
