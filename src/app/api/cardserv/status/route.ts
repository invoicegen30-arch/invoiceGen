import { NextResponse } from "next/server";
import { getCardServStatus } from "@/lib/cardserv";

export async function POST(req: Request) {
  try {
    const { orderMerchantId, orderSystemId, currency } = await req.json();


    if (!orderMerchantId || !currency) {
      return NextResponse.json(
        { success: false, error: "Missing orderMerchantId or currency" },
        { status: 400 }
      );
    }

    // AUD, CAD, NZD are display-only; CardServ charge was in GBP
    const cardServCurrency =
      currency === "AUD" || currency === "CAD" || currency === "NZD" ? "GBP" : currency;
    const statusData = await getCardServStatus(orderMerchantId, orderSystemId, cardServCurrency);

    return NextResponse.json(
      {
        success: true,
        data: {
          orderSystemId: statusData.orderSystemId,
          orderState: statusData.orderState,
          redirectUrl: statusData.redirectUrl,
          raw: statusData.raw,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ CardServ status error:", err);

    return NextResponse.json(
      { success: false, error: err.message || "Status check failed" },
      { status: 500 }
    );
  }
}
