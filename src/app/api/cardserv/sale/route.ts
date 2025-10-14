import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCardServOrder } from "@/lib/cardserv";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const saleData = await createCardServOrder(body);

    const order = await db.order.create({
      data: {
        userEmail: body.email,
        amount: body.amount,
        currency: body.currency,
        description: body.description,
        tokens: body.tokens || null, // ✅ Save tokens to DB
        orderSystemId: saleData.orderSystemId || null,
        orderMerchantId: saleData.orderMerchantId || null,
        status: saleData.orderState || "PROCESSING",
        response: saleData,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order.id,
          status: order.status,
          tokens: order.tokens,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("CardServ sale error:", error);
    return NextResponse.json(
      { error: error.message || "Payment creation failed" },
      { status: 500 }
    );
  }
}
