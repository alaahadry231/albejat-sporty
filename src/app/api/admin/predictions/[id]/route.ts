import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

type Params = { params: Promise<{ id: string }> };

// PUT: تبديل حالة الفائز
export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const result = await sql`
      update predictions
      set is_winner = not is_winner
      where id = ${id}
      returning *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "التوقع غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Toggle winner error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}