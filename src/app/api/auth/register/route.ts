import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password" },
        { status: 400 },
      );
    }

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
        name: email.split("@")[0],
      },
    });

    // Send welcome email
    try {
      await resend.emails.send({
        from: `Invoicerly <${process.env.EMAIL_FROM || "info@invoicerly.co.uk"}>`,
        to: email.toLowerCase(),
        subject: "Welcome to Invoicerly! 🎉",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2>Welcome to Invoicerly!</h2>
            <p>Hi ${newUser.name || "there"},</p>
            <p>Your account has been created successfully. You're ready to start creating professional invoices in seconds.</p>
            <div style="margin:24px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.invoicerly.co.uk"}/generator"
                 style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
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

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
