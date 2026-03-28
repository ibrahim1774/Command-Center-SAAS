import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoUser } from "@/lib/demo-mode";

const DEMO_GOALS = [
  { id: "g1", user_id: "demo", title: "Reach 100K Instagram followers", description: "Growing the main account to 100K", category: "growth", target_value: 100000, current_value: 94200, unit: "followers", deadline: "2026-06-30", why: "Unlock brand partnership tier and get verified", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-03-27T00:00:00Z" },
  { id: "g2", user_id: "demo", title: "Close 5 brand deals this quarter", description: "Land 5 paid brand partnerships in Q1", category: "revenue", target_value: 5, current_value: 3, unit: "deals", deadline: "2026-03-31", why: "Hit $50K revenue target for the quarter", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-03-20T00:00:00Z" },
  { id: "g3", user_id: "demo", title: "Post 5x per week consistently", description: "Maintain 5 posts per week across all platforms", category: "content", target_value: 5, current_value: 4, unit: "posts/week", deadline: null, why: "Consistency is key to growth", created_at: "2026-01-15T00:00:00Z", updated_at: "2026-03-27T00:00:00Z" },
  { id: "g4", user_id: "demo", title: "Save $10K for new studio", description: "Set aside money for studio upgrade", category: "personal", target_value: 10000, current_value: 7200, unit: "$", deadline: "2026-09-01", why: "Need a dedicated space for video production", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-03-15T00:00:00Z" },
  { id: "g5", user_id: "demo", title: "Hit 250K YouTube subscribers", description: "Growing the YouTube channel", category: "growth", target_value: 250000, current_value: 234800, unit: "subscribers", deadline: "2026-06-30", why: "Qualify for YouTube partner program upgrade", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-03-27T00:00:00Z" },
  { id: "g6", user_id: "demo", title: "Launch online course", description: "Create and launch a content creation course on Skillshare", category: "brand", target_value: 100, current_value: 65, unit: "%", deadline: "2026-05-15", why: "Diversify revenue with passive income", created_at: "2026-02-01T00:00:00Z", updated_at: "2026-03-25T00:00:00Z" },
];

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isDemoUser(req)) {
    return NextResponse.json({ goals: DEMO_GOALS });
  }

  const supabase = getSupabaseAdmin();
  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goals: goals || [] });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      title: body.title,
      description: body.description || null,
      category: body.category || "personal",
      target_value: body.target_value || 100,
      current_value: body.current_value || 0,
      unit: body.unit || "%",
      deadline: body.deadline || null,
      why: body.why || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goal });
}
