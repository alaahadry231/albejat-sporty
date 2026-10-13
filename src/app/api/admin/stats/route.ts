import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // إجمالي الزيارات
    const totalViews = await sql`
      select count(*)::int as count from page_views
    `;

    // زوار فريدين (بناءً على visitor_id)
    const uniqueVisitors = await sql`
      select count(distinct visitor_id)::int as count
      from page_views
      where visitor_id is not null
    `;

    // زيارات آخر 7 أيام
    const viewsLast7Days = await sql`
      select
        date_trunc('day', created_at) as day,
        count(*)::int as count
      from page_views
      where created_at > now() - interval '7 days'
      group by day
      order by day asc
    `;

    // الزيارات حسب الصفحة
    const viewsByPage = await sql`
      select page, count(*)::int as count
      from page_views
      group by page
      order by count desc
      limit 10
    `;

    // إجمالي النقرات
    const totalClicks = await sql`
      select count(*)::int as count from clicks
    `;

    // النقرات حسب النوع
    const clicksByType = await sql`
      select item_type, count(*)::int as count
      from clicks
      group by item_type
    `;

    // أكثر البكجات نقراً
    const topPages = await sql`
      select item_id, item_name, count(*)::int as count
      from clicks
      where item_type = 'page'
      group by item_id, item_name
      order by count desc
      limit 10
    `;

    // أكثر البوتات نقراً
    const topBots = await sql`
      select item_id, item_name, count(*)::int as count
      from clicks
      where item_type = 'bot'
      group by item_id, item_name
      order by count desc
      limit 10
    `;

    // عدد البكجات والبوتات
    const totalSportsPages = await sql`
      select count(*)::int as count from sports_pages
    `;

    const totalBots = await sql`
      select count(*)::int as count from telegram_bots
    `;

    // الرسائل
    const totalMessages = await sql`
      select count(*)::int as count from messages
    `;

    const unreadMessages = await sql`
      select count(*)::int as count from messages where is_read = false
    `;

    return NextResponse.json({
      totalViews: totalViews[0].count,
      uniqueVisitors: uniqueVisitors[0].count,
      viewsLast7Days,
      viewsByPage,
      totalClicks: totalClicks[0].count,
      clicksByType,
      topPages,
      topBots,
      totalSportsPages: totalSportsPages[0].count,
      totalBots: totalBots[0].count,
      totalMessages: totalMessages[0].count,
      unreadMessages: unreadMessages[0].count,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Stats failed" }, { status: 500 });
  }
}