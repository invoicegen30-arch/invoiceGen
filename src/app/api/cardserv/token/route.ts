import { NextResponse } from "next/server";

export async function POST() {
  const res = await fetch(`${process.env.CARDSERV_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.CARDSERV_USERNAME,
      password: process.env.CARDSERV_PASSWORD,
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data }, { status: 400 });
  return NextResponse.json({ token: data.access_token });
}
