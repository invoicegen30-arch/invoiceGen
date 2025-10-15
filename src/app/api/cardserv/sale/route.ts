import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCardServOrder } from "@/lib/cardserv";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1️⃣ Створюємо ордер у CardServ
    const saleData = await createCardServOrder(body);

    // 2️⃣ Якщо є redirect URL → одразу редиректимо користувача на 3DS
    if (saleData.redirectUrl) {
      console.log("🔁 Redirecting to 3DS:", saleData.redirectUrl);
      return NextResponse.redirect(saleData.redirectUrl, 302);
    }

    // 3️⃣ Якщо redirect ще не доступний, зберігаємо в БД і повертаємо JSON
    const order = await db.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: body.currency,
        description: body.description,
        tokens: body.tokens || null,
        orderSystemId: saleData.orderSystemId ?? null,
        orderMerchantId: saleData.orderMerchantId,
        status: saleData.orderState || "PROCESSING",
        response: saleData.raw,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Redirect URL not ready yet, order saved",
        data: {
          orderId: order.id,
          orderMerchantId: saleData.orderMerchantId,
          orderSystemId: saleData.orderSystemId,
          status: saleData.orderState,
          redirectUrl: saleData.redirectUrl,
        },
      },
      { status: 202 }
    );
  } catch (error: any) {
    console.error("❌ CardServ sale error:", error);
    return NextResponse.json(
      { error: error.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
