/**
 * Send a test payment receipt PDF email.
 *
 * Usage:  node scripts/send-test-receipt.mjs
 *
 * Requires RESEND_API_KEY in .env (or environment).
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { jsPDF } from "jspdf";
import { Resend } from "resend";

// Load .env manually (no dotenv dependency needed)
try {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
} catch (_) {}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not set. Add it to .env");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

// ── Generate a test PDF ─────────────────────────────────
function generateTestReceiptPDF() {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 20;

  const sym = "£";
  const currency = "GBP";
  const amount = 10.0;
  const tokens = 1000;
  const newBalance = 1000;
  const orderId = "TEST-00000001";
  const merchantId = "MERCH-TEST-001";
  const userName = "Yaroslav (Test)";
  const userEmail = "yaroslav7v@gmail.com";
  const paidAt = new Date();

  const textRight = (text, yPos) => {
    doc.text(text, W - margin, yPos, { align: "right" });
  };
  const drawLine = (yPos) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, W - margin, yPos);
  };

  // HEADER
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Invoicerly", margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("GET STUFFED LTD  ·  Reg: 15673179", margin, 26);
  doc.text("Flat 21 County Chambers, 1 Drapery, Northampton, NN1 2ET, UK", margin, 32);
  doc.text("info@invoicerly.co.uk  ·  +44 7588 664597", margin, 38);

  // TITLE
  y = 56;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Receipt", margin, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Receipt No: PAY-${orderId.slice(-8).toUpperCase()}`, margin, y);
  textRight(
    `Date: ${paidAt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
    y,
  );

  y += 6;
  drawLine(y);

  // BILLED TO
  y += 10;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To", margin, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  for (const [label, value] of [
    ["Name", userName],
    ["Email", userEmail],
  ]) {
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin, y);
    doc.setTextColor(30, 41, 59);
    doc.text(value, margin + 45, y);
    y += 7;
  }

  // PAYMENT DETAILS TABLE
  y += 8;
  drawLine(y);
  y += 8;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", margin, y);
  y += 10;

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y - 5, contentW, 9, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Description", margin + 3, y);
  textRight("Details", y);
  y += 9;

  const tableRows = [
    ["Amount Paid", `${sym}${amount.toFixed(2)} ${currency}`],
    ["Tokens Purchased", `${tokens.toLocaleString()} tokens`],
    ["New Token Balance", `${newBalance.toLocaleString()} tokens`],
    ["Order ID", orderId],
    ["Merchant Order ID", merchantId],
    [
      "Payment Date",
      `${paidAt.toLocaleDateString("en-GB")} ${paidAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
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

  // TOTAL BOX
  y += 6;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin, y - 4, contentW, 14, 2, 2, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Total Paid", margin + 5, y + 4);
  textRight(`${sym}${amount.toFixed(2)} ${currency}`, y + 4);

  // FOOTER NOTE
  y += 24;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("This is a TEST receipt generated for verification purposes.", margin, y);
  y += 5;
  doc.text("No real payment was processed.", margin, y);

  // BOTTOM BAR
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageH - 18, W, 18, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
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

  return doc.output("datauristring").split(",")[1];
}

// ── Send the email ──────────────────────────────────────
async function main() {
  console.log("📄 Generating test receipt PDF...");
  const pdfBase64 = generateTestReceiptPDF();
  console.log(`✅ PDF generated (${Math.round(pdfBase64.length * 0.75 / 1024)} KB)`);

  console.log("📧 Sending email to yaroslav7v@gmail.com...");

  const { data, error } = await resend.emails.send({
    from: `Invoicerly <${process.env.EMAIL_FROM || "info@invoicerly.co.uk"}>`,
    to: "yaroslav7v@gmail.com",
    subject: "Test Payment Receipt — £10.00 GBP",
    attachments: [
      {
        filename: "Invoicerly-Receipt-TEST0001.pdf",
        content: pdfBase64,
      },
    ],
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Payment received ✅</h2>
        <p>Hi Yaroslav,</p>
        <p>This is a <strong>test receipt email</strong> to verify PDF attachment delivery.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#666;">Amount</td><td style="padding:6px 0;text-align:right;font-weight:600;">£10.00 GBP</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Tokens added</td><td style="padding:6px 0;text-align:right;font-weight:600;">1,000</td></tr>
          <tr><td style="padding:6px 0;color:#666;">New balance</td><td style="padding:6px 0;text-align:right;font-weight:600;">1,000 tokens</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Order ID</td><td style="padding:6px 0;text-align:right;font-size:12px;color:#999;">TEST-00000001</td></tr>
        </table>
        <p style="color:#666;font-size:13px;">📎 Your payment receipt is attached as a PDF.</p>
        <p style="color:#666;font-size:13px;">Thank you for using Invoicerly!</p>
      </div>`,
  });

  if (error) {
    console.error("❌ Email failed:", error);
    process.exit(1);
  }

  console.log("✅ Email sent successfully!");
  console.log("   Message ID:", data?.id);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});

