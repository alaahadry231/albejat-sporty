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

    const result = await sql`
      update messages
      set is_read = true
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
    await sql`delete from messages where id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}