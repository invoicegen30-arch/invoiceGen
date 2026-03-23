import { prisma } from "@/lib/prisma";
import { generateRegistrationPDF } from "@/lib/registration-pdf";
import { registerSchema } from "@/lib/validation";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate with zod
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json(
        { message: firstError.message, errors: result.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      street,
      city,
      country,
      postalCode,
      dateOfBirth,
    } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        phone,
        street,
        city,
        country,
        postalCode,
        dateOfBirth: new Date(dateOfBirth),
      },
    });

    // Generate registration confirmation PDF
    let pdfBase64: string | null = null;
    try {
      pdfBase64 = generateRegistrationPDF({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        street,
        city,
        country,
        postalCode,
        dateOfBirth,
        registeredAt: new Date(),
        userId: newUser.id,
      });
    } catch (pdfErr) {
      console.error("⚠️ Failed to generate registration PDF:", pdfErr);
    }

    // Send welcome email with PDF attachment
    try {
      await resend.emails.send({
        from: `Invoicerly <${process.env.EMAIL_FROM || "info@invoicerly.co.uk"}>`,
        to: email.toLowerCase(),
        subject: "Welcome to Invoicerly! 🎉 Your Registration Confirmation",
        attachments: pdfBase64
          ? [
              {
                filename: `Invoicerly-Registration-${newUser.id.slice(-8).toUpperCase()}.pdf`,
                content: pdfBase64,
              },
            ]
          : [],
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2>Welcome to Invoicerly!</h2>
            <p>Hi ${firstName},</p>
            <p>Your account has been created successfully. You're ready to start creating professional invoices in seconds.</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 8px;font-weight:600;color:#334155;">Account Details:</p>
              <p style="margin:2px 0;color:#475569;font-size:14px;">Name: ${firstName} ${lastName}</p>
              <p style="margin:2px 0;color:#475569;font-size:14px;">Email: ${email.toLowerCase()}</p>
              <p style="margin:2px 0;color:#475569;font-size:14px;">Address: ${street}, ${city}, ${country}, ${postalCode}</p>
            </div>
            ${pdfBase64 ? '<p style="color:#666;font-size:13px;">📎 Your registration confirmation is attached as a PDF.</p>' : ""}
            <div style="margin:24px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.invoicerly.co.uk"}/generator"
                 style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
                Create your first invoice →
              </a>
            </div>
            <p style="color:#666;font-size:13px;">Need help? Visit our <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.invoicerly.co.uk"}/help/getting-started">Getting Started</a> guide.</p>
            <p style="color:#666;font-size:13px;">— The Invoicerly Team</p>
          </div>`,
      });
      console.log(`📧 Welcome email sent to ${email}`);
    } catch (emailErr) {
      console.error("⚠️ Failed to send welcome email:", emailErr);
    }

    return NextResponse.json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
