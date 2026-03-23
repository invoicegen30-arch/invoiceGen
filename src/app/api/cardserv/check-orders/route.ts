import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCardServStatus } from "@/lib/cardserv";
import { fulfillApprovedOrder } from "@/lib/fulfill-order";

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
          await fulfillApprovedOrder(order.orderMerchantId!);
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
