import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, prize, prize_type } = body;

    if (!code || !prize || !prize_type) {
      return NextResponse.json(
        { error: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim();

    // نتأكد إنه الكود موجود ومو مستخدم
    const existing = await sql`
      select id, is_used
      from spin_codes
      where code = ${trimmedCode}
      limit 1
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "الكود غير موجود" },
        { status: 404 }
      );
    }

    if (existing[0].is_used) {
      return NextResponse.json(
        { error: "هذا الكود مستخدم من قبل" },
        { status: 400 }
      );
    }

    // نحدّث الكود بالنتيجة
    await sql`
      update spin_codes
      set is_used = true,
          used_at = now(),
          prize_won = ${prize},
          prize_type = ${prize_type}
      where code = ${trimmedCode}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save result error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء الحفظ" },
      { status: 500 }
    );
  }
}