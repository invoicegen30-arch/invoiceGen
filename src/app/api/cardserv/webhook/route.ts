import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import { fulfillApprovedOrder } from "@/lib/fulfill-order";

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
      await fulfillApprovedOrder(orderMerchantId);
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
