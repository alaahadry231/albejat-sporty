import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

type Params = { params: Promise<{ id: string }> };

// PUT: تعديل مباراة
export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // إذا كان الطلب لتبديل حالة التوقع
    if (body.action === "toggle_predictions") {
      const result = await sql`
        update matches
        set predictions_open = not predictions_open
        where id = ${id}
        returning *
      `;
      return NextResponse.json({ data: result[0] });
    }

    // إذا كان الطلب لإنهاء المباراة
    if (body.action === "finish") {
      const { final_score1, final_score2 } = body;

      if (
        typeof final_score1 !== "number" ||
        typeof final_score2 !== "number"
      ) {
        return NextResponse.json(
          { error: "النتيجة النهائية مطلوبة" },
          { status: 400 }
        );
      }

      const result = await sql`
        update matches
        set status = 'finished',
            final_score1 = ${final_score1},
            final_score2 = ${final_score2},
            predictions_open = false
        where id = ${id}
        returning *
      `;
      return NextResponse.json({ data: result[0] });
    }

    // تعديل عادي
    const { team1, team2, match_date } = body;

    const result = await sql`
      update matches
      set team1 = ${team1},
          team2 = ${team2},
          match_date = ${match_date}
      where id = ${id}
      returning *
    `;

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE: حذف مباراة
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await sql`delete from matches where id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}