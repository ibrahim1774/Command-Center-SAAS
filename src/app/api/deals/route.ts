import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoUser } from "@/lib/demo-mode";

const DEMO_DEALS = [
  { id: "d1", user_id: "demo", brand_name: "Glossier", contact_person: "Sarah Chen", contact_email: "sarah@glossier.com", deal_value: 12000, platforms: ["instagram"], deal_type: "sponsored_post", description: "Spring campaign — 3 Reels over 6 weeks", deadline: "2026-04-15", status: "inquiry", payment_status: "unpaid", payment_received: 0, created_at: "2026-03-20T00:00:00Z", updated_at: "2026-03-20T00:00:00Z" },
  { id: "d2", user_id: "demo", brand_name: "Nike Digital", contact_person: "Marcus Johnson", contact_email: "marcus@nike.com", deal_value: 35000, platforms: ["youtube"], deal_type: "brand_ambassador", description: "Creator program — 2 long-form videos + social", deadline: "2026-05-01", status: "negotiating", payment_status: "unpaid", payment_received: 0, created_at: "2026-03-18T00:00:00Z", updated_at: "2026-03-22T00:00:00Z" },
  { id: "d3", user_id: "demo", brand_name: "Squarespace", contact_person: "Emily Rodriguez", contact_email: "emily@squarespace.com", deal_value: 8500, platforms: ["youtube"], deal_type: "sponsored_post", description: "Sponsored segment in 1 video", deadline: "2026-04-30", status: "inquiry", payment_status: "unpaid", payment_received: 0, created_at: "2026-03-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z" },
  { id: "d4", user_id: "demo", brand_name: "Adobe Creative Cloud", contact_person: "James Park", contact_email: "jpark@adobe.com", deal_value: 24000, platforms: ["instagram"], deal_type: "brand_ambassador", description: "Annual partnership — monthly content", deadline: "2026-06-30", status: "in-progress", payment_status: "invoiced", payment_received: 0, created_at: "2026-02-01T00:00:00Z", updated_at: "2026-03-01T00:00:00Z" },
  { id: "d5", user_id: "demo", brand_name: "Canva", contact_person: "Lisa Tran", contact_email: "lisa@canva.com", deal_value: 6000, platforms: ["instagram"], deal_type: "product_review", description: "Creator spotlight feature", deadline: "2026-04-20", status: "inquiry", payment_status: "unpaid", payment_received: 0, created_at: "2026-03-22T00:00:00Z", updated_at: "2026-03-22T00:00:00Z" },
  { id: "d6", user_id: "demo", brand_name: "Notion", contact_person: "David Kim", contact_email: "david@notion.so", deal_value: 15000, platforms: ["youtube"], deal_type: "sponsored_post", description: "Workflow series — 3 videos", deadline: "2026-05-15", status: "negotiating", payment_status: "unpaid", payment_received: 0, created_at: "2026-03-10T00:00:00Z", updated_at: "2026-03-20T00:00:00Z" },
  { id: "d7", user_id: "demo", brand_name: "Samsung", contact_person: "Alex Rivera", contact_email: "alex@samsung.com", deal_value: 42000, platforms: ["youtube"], deal_type: "brand_ambassador", description: "Galaxy Creator Program — Q2/Q3", deadline: "2026-07-31", status: "in-progress", payment_status: "invoiced", payment_received: 0, created_at: "2026-01-15T00:00:00Z", updated_at: "2026-03-15T00:00:00Z" },
  { id: "d8", user_id: "demo", brand_name: "Skillshare", contact_person: "Rachel Green", contact_email: "rachel@skillshare.com", deal_value: 18000, platforms: ["youtube"], deal_type: "ugc", description: "Original class + promotional content", deadline: "2026-03-15", status: "completed", payment_status: "paid", payment_received: 18000, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-03-15T00:00:00Z" },
  { id: "d9", user_id: "demo", brand_name: "Monday.com", contact_person: "Tom Wilson", contact_email: "tom@monday.com", deal_value: 10000, platforms: ["instagram"], deal_type: "sponsored_post", description: "Productivity series — 5 Reels", deadline: "2026-03-01", status: "completed", payment_status: "paid", payment_received: 10000, created_at: "2026-01-10T00:00:00Z", updated_at: "2026-03-10T00:00:00Z" },
  { id: "d10", user_id: "demo", brand_name: "Epidemic Sound", contact_person: "Anna Svensson", contact_email: "anna@epidemicsound.com", deal_value: 7500, platforms: ["youtube"], deal_type: "affiliate", description: "Music licensing integration", deadline: "2026-02-28", status: "completed", payment_status: "paid", payment_received: 7500, created_at: "2025-12-15T00:00:00Z", updated_at: "2026-03-01T00:00:00Z" },
];

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isDemoUser(req)) {
    return NextResponse.json({ deals: DEMO_DEALS });
  }

  const supabase = getSupabaseAdmin();
  const { data: deals, error } = await supabase
    .from("brand_deals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deals: deals || [] });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data: deal, error } = await supabase
    .from("brand_deals")
    .insert({
      user_id: userId,
      brand_name: body.brand_name,
      contact_person: body.contact_person || null,
      contact_email: body.contact_email || null,
      deal_value: body.deal_value || 0,
      platforms: body.platforms || [],
      deal_type: body.deal_type || "other",
      description: body.description || null,
      deadline: body.deadline || null,
      status: body.status || "inquiry",
      payment_status: body.payment_status || "unpaid",
      payment_received: body.payment_received || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deal });
}
