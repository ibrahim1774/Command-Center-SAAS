import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoUser } from "@/lib/demo-mode";

const DEMO_TASKS = [
  { id: "t1", user_id: "demo", title: "Edit Reel for Nike collab", due_date: "2026-03-28", priority: "urgent", category: "content", is_completed: true, completed_at: "2026-03-27T14:00:00Z", related_deal_id: null, created_at: "2026-03-25T00:00:00Z" },
  { id: "t2", user_id: "demo", title: "Reply to Spotify partnership email", due_date: "2026-03-28", priority: "important", category: "deals", is_completed: true, completed_at: "2026-03-27T16:00:00Z", related_deal_id: null, created_at: "2026-03-26T00:00:00Z" },
  { id: "t3", user_id: "demo", title: "Draft caption for tomorrow's carousel", due_date: "2026-03-28", priority: "normal", category: "content", is_completed: false, completed_at: null, related_deal_id: null, created_at: "2026-03-27T00:00:00Z" },
  { id: "t4", user_id: "demo", title: "Review Samsung contract terms", due_date: "2026-03-29", priority: "important", category: "deals", is_completed: false, completed_at: null, related_deal_id: "d7", created_at: "2026-03-26T00:00:00Z" },
  { id: "t5", user_id: "demo", title: "Film BTS for Glossier campaign", due_date: "2026-03-30", priority: "normal", category: "content", is_completed: false, completed_at: null, related_deal_id: "d1", created_at: "2026-03-25T00:00:00Z" },
  { id: "t6", user_id: "demo", title: "Send invoice to Adobe CC", due_date: "2026-03-31", priority: "important", category: "admin", is_completed: false, completed_at: null, related_deal_id: "d4", created_at: "2026-03-20T00:00:00Z" },
  { id: "t7", user_id: "demo", title: "Research trending audio for next Reel", due_date: null, priority: "normal", category: "content", is_completed: false, completed_at: null, related_deal_id: null, created_at: "2026-03-27T00:00:00Z" },
];

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isDemoUser(req)) {
    return NextResponse.json({ tasks: DEMO_TASKS });
  }

  const supabase = getSupabaseAdmin();

  // Get incomplete tasks + recently completed (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .or(`is_completed.eq.false,completed_at.gte.${sevenDaysAgo}`)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: tasks || [] });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: body.title,
      due_date: body.due_date || null,
      priority: body.priority || "normal",
      category: body.category || "personal",
      related_deal_id: body.related_deal_id || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task });
}
