export async function createCardServOrder(payload: any) {
  const {
    CARDSERV_BASE_URL,
    CARDSERV_REQUESTOR_ID,
    CARDSERV_MERCHANT_ID,
    CARDSERV_BEARER_TOKEN,
    CARDSERV_CURRENCY,
  } = process.env;

  const baseUrl = CARDSERV_BASE_URL?.replace(/\/+$/, "") || "https://test.cardserv.io";
  const url = `${baseUrl}/api/payments/sale/${CARDSERV_REQUESTOR_ID}`;

  const headers = {
    Authorization: `Bearer ${CARDSERV_BEARER_TOKEN}`,
    "Content-Type": "application/json",
  };

  const body = {
    order: {
      orderMerchantId: CARDSERV_MERCHANT_ID,
      orderDescription: payload.description || `Sale #${Date.now()}`,
      orderAmount: payload.amount?.toFixed(2) || "1.00",
      orderCurrencyCode: CARDSERV_CURRENCY || "EUR",
    },
    customer: {
      firstname: payload.card.name?.split(" ")[0] || "John",
      lastname: payload.card.name?.split(" ")[1] || "Doe",
      customerEmail: payload.email || "test@example.com",
      address: {
        countryCode: "GB",
        zipCode: payload.card.postalCode || "00000",
        city: payload.card.city || "London",
        line1: payload.card.address || "123 Baker Street",
      },
    },
    card: {
      cardNumber: payload.card.cardNumber || "4444444411111111",
      cvv2: payload.card.cvv || "872",
      expireMonth: payload.card.expiry?.split("/")[0] || "10",
      expireYear: `20${payload.card.expiry?.split("/")[1] || "26"}`,
      cardPrintedName: payload.card.name || "John Doe",
    },
    urls: {
      resultUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/cardserv/webhook`,
    },
  };

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

  const raw = await res.text();
  // 🧠 Якщо CardServ не повертає JSON — не падаємо
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { orderState: "PROCESSING", raw };
  }

  // навіть якщо 200, але не JSON — зберігаємо як "створено, очікує підтвердження"
  return {
    ...parsed,
    ok: res.ok,
    orderState: parsed?.orderState || "PROCESSING",
    statusCode: res.status,
  };
}
