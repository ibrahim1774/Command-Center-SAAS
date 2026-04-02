import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const DEMO_EMAIL = "ibrahimttshop@gmail.com";

export async function isDemoUser(req: NextRequest): Promise<boolean> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const email = (token?.email as string) || "";
  return email === DEMO_EMAIL;
}

export function isDemoEmail(email: string | null | undefined): boolean {
  return email === DEMO_EMAIL;
}

export async function isTestModeEnabled(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("cached_data")
    .select("value")
    .eq("key", `test_mode:${userId}`)
    .single();

  return (data?.value as Record<string, boolean>)?.enabled || false;
}

/** Returns true if the user should see mock data (demo email OR test mode toggle) */
export async function shouldShowMockData(req: NextRequest, userId: string): Promise<boolean> {
  if (await isDemoUser(req)) return true;
  return isTestModeEnabled(userId);
}
