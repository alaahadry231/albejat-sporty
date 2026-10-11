import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await sql`
      select * from sports_pages
      order by sort_order asc, created_at desc
    `;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, code, image_url, category, rate } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "الاسم والكود مطلوبين" },
        { status: 400 }
      );
    }

    const result = await sql`
      insert into sports_pages (name, description, code, image_url, category, rate)
      values (${name}, ${description || ""}, ${code}, ${image_url || ""}, ${category || "عام"}, ${rate || "×1"})
      returning *
    `;

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}