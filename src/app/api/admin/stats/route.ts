import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/checkAdmin";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // إحصائيات الزيارات
    const totalViews = await sql`
      select count(*)::int as count from page_views
    `;

    const uniqueVisitors = await sql`
      select count(distinct visitor_id)::int as count
      from page_views
      where visitor_id is not null
    `;

    const viewsLast7Days = await sql`
      select
        date_trunc('day', created_at) as day,
        count(*)::int as count
      from page_views
      where created_at > now() - interval '7 days'
      group by day
      order by day asc
    `;

    const viewsByPage = await sql`
      select page, count(*)::int as count
      from page_views
      group by page
      order by count desc
      limit 10
    `;

    // إحصائيات النقرات
    const totalClicks = await sql`
      select count(*)::int as count from clicks
    `;

    const clicksByType = await sql`
      select item_type, count(*)::int as count
      from clicks
      group by item_type
    `;

    const topPages = await sql`
      select item_id, item_name, count(*)::int as count
      from clicks
      where item_type = 'page'
      group by item_id, item_name
      order by count desc
      limit 10
    `;

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

    // ============ إحصائيات التوقعات ============
    const totalPredictions = await sql`
      select count(*)::int as count from predictions
    `;

    const totalWinners = await sql`
      select count(*)::int as count
      from predictions
      where is_winner = true
    `;

    const topMatchByPredictions = await sql`
      select
        m.id,
        m.team1,
        m.team2,
        count(p.id)::int as predictions_count
      from matches m
      left join predictions p on p.match_id = m.id
      group by m.id, m.team1, m.team2
      having count(p.id) > 0
      order by predictions_count desc
      limit 1
    `;

    const totalMatches = await sql`
      select count(*)::int as count from matches
    `;

    const finishedMatches = await sql`
      select count(*)::int as count
      from matches
      where status = 'finished'
    `;

    // ============ إحصائيات العجلة ============
    const totalSpinCodes = await sql`
      select count(*)::int as count from spin_codes
    `;

    const usedSpinCodes = await sql`
      select count(*)::int as count
      from spin_codes
      where is_used = true
    `;

    const topPrize = await sql`
      select prize_won, count(*)::int as count
      from spin_codes
      where is_used = true
        and prize_won is not null
        and prize_type = 'win'
      group by prize_won
      order by count desc
      limit 1
    `;

    // إجمالي الجوائز المصروفة (نحول النص لرقم)
    const totalPrizesResult = await sql`
      select
        coalesce(
          sum(
            case
              when prize_type = 'win' and prize_won is not null
              then cast(replace(prize_won, '.', '') as integer)
              else 0
            end
          ),
          0
        )::bigint as total
      from spin_codes
      where is_used = true
    `;

    return NextResponse.json({
      // الزيارات
      totalViews: totalViews[0].count,
      uniqueVisitors: uniqueVisitors[0].count,
      viewsLast7Days,
      viewsByPage,

      // النقرات
      totalClicks: totalClicks[0].count,
      clicksByType,
      topPages,
      topBots,

      // المحتوى
      totalSportsPages: totalSportsPages[0].count,
      totalBots: totalBots[0].count,
      totalMessages: totalMessages[0].count,
      unreadMessages: unreadMessages[0].count,

      // التوقعات
      totalPredictions: totalPredictions[0].count,
      totalWinners: totalWinners[0].count,
      topMatchByPredictions:
        topMatchByPredictions.length > 0 ? topMatchByPredictions[0] : null,
      totalMatches: totalMatches[0].count,
      finishedMatches: finishedMatches[0].count,

      // العجلة
      totalSpinCodes: totalSpinCodes[0].count,
      usedSpinCodes: usedSpinCodes[0].count,
      topPrize: topPrize.length > 0 ? topPrize[0] : null,
      totalPrizes: Number(totalPrizesResult[0].total),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Stats failed" }, { status: 500 });
  }
}