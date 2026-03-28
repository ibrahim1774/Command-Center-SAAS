import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isDemoUser } from "@/lib/demo-mode";

const DEMO_JOURNAL = [
  { id: "j1", user_id: "demo", content: "Amazing day! Nike approved the final edit for the creator program video. The collab video hit 340K views overnight — biggest one yet. Glossier wants to jump on a call tomorrow about the spring campaign. Also hit 94K followers on IG, so close to 100K!", mood: "amazing", tags: ["milestone", "brand-deal"], entry_date: "2026-03-27", created_at: "2026-03-27T22:00:00Z" },
  { id: "j2", user_id: "demo", content: "Good productive day. Finished editing 2 Reels and scheduled them for the week. Had a great brainstorm session about the Skillshare course outline. Need to finalize the Samsung contract by Friday — their legal team sent over revisions.", mood: "good", tags: ["content", "productivity"], entry_date: "2026-03-26", created_at: "2026-03-26T21:00:00Z" },
  { id: "j3", user_id: "demo", content: "Feeling a bit overwhelmed today. Lots of deadlines piling up — Adobe CC monthly content is due, Samsung wants revisions, and I still need to film the Glossier BTS. Need to prioritize better. On the bright side, engagement rate is up to 4.8% which is the highest it's been.", mood: "okay", tags: ["reflection", "stress"], entry_date: "2026-03-25", created_at: "2026-03-25T20:00:00Z" },
  { id: "j4", user_id: "demo", content: "Great day for content creation! Filmed 3 Reels back to back and the lighting setup finally clicked. The new ring light makes such a difference. Also got a DM from Notion asking about a potential collaboration — exciting!", mood: "good", tags: ["content", "filming"], entry_date: "2026-03-24", created_at: "2026-03-24T19:00:00Z" },
  { id: "j5", user_id: "demo", content: "Quiet Sunday. Took the day mostly off but spent an hour reviewing analytics. The carousel about viral posts is still getting saves 3 days later — might do a follow-up. Rest days are important for creativity.", mood: "good", tags: ["rest", "analytics"], entry_date: "2026-03-23", created_at: "2026-03-23T18:00:00Z" },
];

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isDemoUser(req)) {
    return NextResponse.json({ entries: DEMO_JOURNAL, total: DEMO_JOURNAL.length });
  }

  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const supabase = getSupabaseAdmin();

  const { count } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .range(offset, offset + 19);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: entries || [], total: count || 0 });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data: entry, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: userId,
      content: body.content,
      mood: body.mood || null,
      tags: body.tags || [],
      entry_date: body.entry_date || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry });
}
