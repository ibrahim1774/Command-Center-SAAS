import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const supabase = getSupabaseAdmin();

  const [eventsRes, dealsRes, tasksRes] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .gte("event_date", startDate)
      .lt("event_date", endDate)
      .order("event_date", { ascending: true }),
    supabase
      .from("brand_deals")
      .select("id, brand_name, deadline, status")
      .eq("user_id", userId)
      .gte("deadline", startDate)
      .lt("deadline", endDate),
    supabase
      .from("tasks")
      .select("id, title, due_date, priority, is_completed")
      .eq("user_id", userId)
      .gte("due_date", startDate)
      .lt("due_date", endDate),
  ]);

  return NextResponse.json({
    events: eventsRes.data || [],
    dealDeadlines: dealsRes.data || [],
    taskDueDates: tasksRes.data || [],
  });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data: event, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: userId,
      title: body.title,
      event_date: body.event_date,
      event_time: body.event_time || null,
      event_type: body.event_type || "personal",
      notes: body.notes || null,
      color: body.color || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event });
}
