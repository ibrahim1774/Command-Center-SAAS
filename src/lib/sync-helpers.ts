import { getSupabaseAdmin } from "./supabase-admin";

export type SyncResult = {
  success: boolean;
  error?: string;
  recordsProcessed?: number;
};

export async function logSync(
  userId: string,
  platform: string,
  status: "success" | "error",
  errorMessage?: string
) {
  await getSupabaseAdmin().from("sync_logs").insert({
    user_id: userId,
    platform,
    status,
    error_message: errorMessage || null,
  });
}

export async function getConnectedAccount(userId: string, platform: string) {
  const { data } = await getSupabaseAdmin()
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("status", "active")
    .single();

  return data;
}

export async function updateLastSynced(userId: string, platform: string) {
  await getSupabaseAdmin()
    .from("connected_accounts")
    .update({ last_synced: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("platform", platform);
}
