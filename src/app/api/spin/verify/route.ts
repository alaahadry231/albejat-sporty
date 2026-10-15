import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "الرجاء إدخال الكود" },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim();

    // نبحث عن الكود في قاعدة البيانات
    const result = await sql`
      select id, code, is_used
      from spin_codes
      where code = ${trimmedCode}
      limit 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "الكود غير صحيح" },
        { status: 404 }
      );
    }

    const codeData = result[0];

    if (codeData.is_used) {
      return NextResponse.json(
        { error: "هذا الكود مستخدم من قبل" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      codeId: codeData.id,
      code: codeData.code,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق" },
      { status: 500 }
    );
  }
}