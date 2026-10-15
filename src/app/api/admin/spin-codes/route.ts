import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

// GET: عرض كل الأكواد
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await sql`
      select * from spin_codes
      order by created_at desc
    `;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST: توليد أكواد جديدة
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { count } = body;

    const numCount = Math.min(Math.max(parseInt(count) || 1, 1), 100);

    const newCodes: string[] = [];

    for (let i = 0; i < numCount; i++) {
      // نولّد كود عشوائي: 8 أحرف كبيرة + أرقام
      const code = generateCode();
      newCodes.push(code);
    }

    // نضيفهم للداتابيس (مع تخطي أي تكرار)
    for (const code of newCodes) {
      try {
        await sql`
          insert into spin_codes (code)
          values (${code})
          on conflict (code) do nothing
        `;
      } catch (err) {
        console.error("Insert code error:", err);
      }
    }

    return NextResponse.json({ success: true, codes: newCodes });
  } catch (error) {
    console.error("Generate codes error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التوليد" },
      { status: 500 }
    );
  }
}

// دالة توليد كود عشوائي
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // بدون حروف مشتبهة
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}