import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
