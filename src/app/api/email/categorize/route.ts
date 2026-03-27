import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/oauth-helpers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAnthropicClient } from "@/lib/anthropic";
import { parseClaudeJSON } from "@/lib/parse-claude-json";
import type { EmailCategorization } from "@/types/ai";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch uncategorized emails
  const { data: emails, error: fetchErr } = await supabase
    .from("emails")
    .select("id, from_name, from_email, subject, snippet")
    .eq("user_id", userId)
    .or("category.is.null,category.eq.")
    .limit(50);

  if (fetchErr) {
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }

  if (!emails || emails.length === 0) {
    return NextResponse.json({ categorized: 0 });
  }

  // Build prompt payload
  const emailList = emails.map((e) => ({
    id: e.id,
    from: e.from_name || e.from_email || "Unknown",
    subject: e.subject || "(no subject)",
    snippet: e.snippet || "",
  }));

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system:
        "You are an email categorizer for a social media content creator. " +
        "Categorize each email and return ONLY a valid JSON array, no other text.\n\n" +
        "Categories: brand_deal (sponsorship/collaboration inquiries), customer (fan messages, client communication), " +
        "newsletter (marketing emails, updates, digests), other (everything else).\n\n" +
        "Priority: high (needs immediate attention — brand deals, urgent requests), " +
        "medium (important but not urgent), low (newsletters, automated notifications).\n\n" +
        "Return format: [{\"email_id\": \"<id>\", \"category\": \"...\", \"priority\": \"...\", \"needs_response\": true/false}]",
      messages: [
        {
          role: "user",
          content: `Categorize these emails:\n\n${JSON.stringify(emailList, null, 2)}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
    const categorizations = parseClaudeJSON<EmailCategorization[]>(responseText);

    // Batch update emails
    let categorized = 0;
    for (const cat of categorizations) {
      const { error: updateErr } = await supabase
        .from("emails")
        .update({
          category: cat.category,
          priority: cat.priority,
          needs_response: cat.needs_response,
        })
        .eq("id", cat.email_id)
        .eq("user_id", userId);

      if (!updateErr) categorized++;
    }

    return NextResponse.json({ categorized });
  } catch (err) {
    console.error("Email categorization error:", err);
    return NextResponse.json(
      { error: "Failed to categorize emails" },
      { status: 500 }
    );
  }
}
