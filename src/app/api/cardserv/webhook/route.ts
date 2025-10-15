import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 CardServ Webhook received:", body);

    const orderMerchantId = body.orderMerchantId || body.order?.orderMerchantId;
    const orderSystemId = body.orderSystemId || body.order?.orderSystemId;

    if (!orderMerchantId && !orderSystemId) {
      console.error("❌ Webhook missing order IDs:", body);
      return NextResponse.json(
        { ok: false, error: "orderMerchantId or orderSystemId missing" },
        { status: 400 }
      );
    }

    // 🔹 Отримуємо оновлений статус з CardServ
    const statusData = await getCardServStatus(orderMerchantId);

    // 🔹 Оновлюємо статус ордеру в базі
    await db.order.updateMany({
      where: { orderMerchantId },
      data: {
        status: statusData.orderState,
        response: statusData.raw,
      },
    });

    console.log("✅ Order updated:", orderMerchantId, statusData.orderState);

    return NextResponse.json({ ok: true, status: statusData.orderState });
  } catch (err: any) {
    console.error("❌ CardServ webhook error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // CardServ може робити health-check GET-запитом
  return NextResponse.json({ ok: true });
}
