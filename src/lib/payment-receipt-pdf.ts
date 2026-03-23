import { jsPDF } from "jspdf";

interface PaymentReceiptData {
  orderId: string;
  orderMerchantId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  tokens: number;
  newBalance: number;
  paidAt: Date;
}

/**
 * Generates a payment receipt PDF and returns it as a base64 string.
 */
export function generatePaymentReceiptPDF(data: PaymentReceiptData): string {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 20;

  const sym =
    data.currency === "GBP"
      ? "£"
      : data.currency === "EUR"
        ? "€"
        : data.currency === "AUD"
          ? "A$"
          : data.currency === "CAD"
            ? "C$"
            : data.currency === "NZD"
              ? "NZ$"
              : "$";

  // ── Helpers ──
  const textRight = (text: string, yPos: number) => {
    doc.text(text, W - margin, yPos, { align: "right" });
  };

  const drawLine = (yPos: number) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, W - margin, yPos);
  };

  // ══════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, W, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Invoicerly", margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("GET STUFFED LTD  ·  Reg: 15673179", margin, 26);
  doc.text(
    "Flat 21 County Chambers, 1 Drapery, Northampton, NN1 2ET, UK",
    margin,
    32,
  );
  doc.text("info@invoicerly.co.uk  ·  +44 7588 664597", margin, 38);

  // ══════════════════════════════════════
  // DOCUMENT TITLE
  // ══════════════════════════════════════
  y = 56;
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Receipt", margin, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    `Receipt No: PAY-${data.orderId.slice(-8).toUpperCase()}`,
    margin,
    y,
  );
  textRight(
    `Date: ${data.paidAt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
    y,
  );

  y += 6;
  drawLine(y);

  // ══════════════════════════════════════
  // BILLED TO
  // ══════════════════════════════════════
  y += 10;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To", margin, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85); // slate-700

  const billedRows: [string, string][] = [
    ["Name", data.userName || "—"],
    ["Email", data.userEmail],
  ];

  for (const [label, value] of billedRows) {
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin, y);
    doc.setTextColor(30, 41, 59);
    doc.text(value, margin + 45, y);
    y += 7;
  }

  // ══════════════════════════════════════
  // PAYMENT DETAILS TABLE
  // ══════════════════════════════════════
  y += 8;
  drawLine(y);
  y += 8;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", margin, y);
  y += 10;

  // Table header
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, y - 5, contentW, 9, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text("Description", margin + 3, y);
  textRight("Details", y);
  y += 9;

  // Table rows
  const tableRows: [string, string][] = [
    ["Amount Paid", `${sym}${data.amount.toFixed(2)} ${data.currency}`],
    ["Tokens Purchased", `${data.tokens.toLocaleString()} tokens`],
    ["New Token Balance", `${data.newBalance.toLocaleString()} tokens`],
    ["Order ID", data.orderId],
    ["Merchant Order ID", data.orderMerchantId],
    [
      "Payment Date",
      `${data.paidAt.toLocaleDateString("en-GB")} ${data.paidAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    ],
    ["Payment Method", "Card (CardServ)"],
    ["Status", "APPROVED ✓"],
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const [desc, detail] of tableRows) {
    drawLine(y - 3);
    doc.setTextColor(51, 65, 85);
    doc.text(desc, margin + 3, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    textRight(detail, y);
    doc.setFont("helvetica", "normal");
    y += 9;
  }

  drawLine(y - 3);

  // ══════════════════════════════════════
  // TOTAL BOX
  // ══════════════════════════════════════
  y += 6;
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(margin, y - 4, contentW, 14, 2, 2, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text("Total Paid", margin + 5, y + 4);
  textRight(`${sym}${data.amount.toFixed(2)} ${data.currency}`, y + 4);

  // ══════════════════════════════════════
  // FOOTER NOTE
  // ══════════════════════════════════════
  y += 24;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "This receipt confirms your token purchase with Invoicerly (GET STUFFED LTD).",
    margin,
    y,
  );
  y += 5;
  doc.text(
    "Tokens have been credited to your account and are ready to use immediately.",
    margin,
    y,
  );
  y += 5;
  doc.text("Please keep this document for your records.", margin, y);

  // ══════════════════════════════════════
  // BOTTOM BAR
  // ══════════════════════════════════════
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageH - 18, W, 18, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    "GET STUFFED LTD · Flat 21 County Chambers, 1 Drapery, Northampton, NN1 2ET · Reg: 15673179",
    W / 2,
    pageH - 10,
    { align: "center" },
  );
  doc.text(
    "www.invoicerly.co.uk · info@invoicerly.co.uk · +44 7588 664597",
    W / 2,
    pageH - 5.5,
    { align: "center" },
  );

  // Return as base64
  return doc.output("datauristring").split(",")[1];
}

