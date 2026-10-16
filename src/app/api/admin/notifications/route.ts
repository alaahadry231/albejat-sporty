import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await sql`
      select * from notifications
      order by created_at desc
    `;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "العنوان والرسالة مطلوبين" },
        { status: 400 }
      );
    }

    const result = await sql`
      insert into notifications (title, message, type)
      values (${title.trim()}, ${message.trim()}, ${type || "info"})
      returning *
    `;

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}