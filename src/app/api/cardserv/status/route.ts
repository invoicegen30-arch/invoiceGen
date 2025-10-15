import { NextResponse } from "next/server";
import { getCardServStatus } from "@/lib/cardserv";

export async function POST(req: Request) {
  try {
    const { orderMerchantId } = await req.json();

    if (!orderMerchantId) {
      return NextResponse.json(
        { success: false, error: "Missing orderMerchantId" },
        { status: 400 }
      );
    }

    const statusData = await getCardServStatus(orderMerchantId);

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
