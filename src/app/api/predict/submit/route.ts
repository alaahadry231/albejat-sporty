import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { match_id, name, telegram, score1, score2 } = body;

    // التحقق من البيانات
    if (!match_id || !name || !telegram) {
      return NextResponse.json(
        { error: "الرجاء تعبئة جميع الحقول" },
        { status: 400 }
      );
    }

    if (typeof score1 !== "number" || typeof score2 !== "number") {
      return NextResponse.json(
        { error: "الرجاء إدخال التوقع بشكل صحيح" },
        { status: 400 }
      );
    }

    if (score1 < 0 || score2 < 0 || score1 > 50 || score2 > 50) {
      return NextResponse.json(
        { error: "النتيجة غير معقولة" },
        { status: 400 }
      );
    }

    // التحقق من التلغرام
    const trimmedTelegram = telegram.trim();
    if (!trimmedTelegram.startsWith("@") || trimmedTelegram.length < 2) {
      return NextResponse.json(
        { error: "معرّف تلغرام يجب أن يبدأ بـ @" },
        { status: 400 }
      );
    }

    if (name.trim().length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "الاسم يجب أن يكون بين 2 و 50 حرف" },
        { status: 400 }
      );
    }

    // نتأكد إنه المباراة موجودة والتوقعات مفتوحة
    const match = await sql`
      select id, status, predictions_open
      from matches
      where id = ${match_id}
      limit 1
    `;

    if (match.length === 0) {
      return NextResponse.json(
        { error: "المباراة غير موجودة" },
        { status: 404 }
      );
    }

    if (match[0].status !== "upcoming") {
      return NextResponse.json(
        { error: "هذي المباراة انتهت" },
        { status: 400 }
      );
    }

    if (!match[0].predictions_open) {
      return NextResponse.json(
        { error: "التوقعات على هذي المباراة موقفة" },
        { status: 400 }
      );
    }

    // نحفظ التوقع
    await sql`
      insert into predictions (match_id, name, telegram, score1, score2)
      values (${match_id}, ${name.trim()}, ${trimmedTelegram}, ${score1}, ${score2})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit prediction error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء الحفظ" },
      { status: 500 }
    );
  }
}