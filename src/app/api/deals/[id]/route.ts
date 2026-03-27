import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: deal, error } = await supabase
    .from("brand_deals")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const [notesRes, checklistRes] = await Promise.all([
    supabase
      .from("deal_notes")
      .select("*")
      .eq("deal_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("deal_checklist")
      .select("*")
      .eq("deal_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  return NextResponse.json({
    deal,
    notes: notesRes.data || [],
    checklist: checklistRes.data || [],
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data: deal, error } = await supabase
    .from("brand_deals")
    .update(body)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deal });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("brand_deals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
