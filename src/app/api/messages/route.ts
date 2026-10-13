import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "الرجاء تعبئة جميع الحقول" },
        { status: 400 }
      );
    }

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      return NextResponse.json(
        { error: "البيانات طويلة جداً" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير صحيح" },
        { status: 400 }
      );
    }

    await sql`
      insert into messages (name, email, message)
      values (${name}, ${email}, ${message})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Insert message error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء الإرسال" },
      { status: 500 }
    );
  }
}