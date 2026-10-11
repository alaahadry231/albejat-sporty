import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, code, image_url, category, rate, is_published } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "الاسم والكود مطلوبين" },
        { status: 400 }
      );
    }

    const result = await sql`
      update sports_pages
      set name = ${name},
          description = ${description || ""},
          code = ${code},
          image_url = ${image_url || ""},
          category = ${category || "عام"},
          rate = ${rate || "×1"},
          is_published = ${is_published ?? true}
      where id = ${id}
      returning *
    `;

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await sql`delete from sports_pages where id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}