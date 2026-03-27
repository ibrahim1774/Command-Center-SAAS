import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export function generateState(): string {
  return crypto.randomUUID();
}

export async function setStateCookie(platform: string, state: string) {
  const cookieStore = await cookies();
  cookieStore.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });
}

export async function validateStateCookie(platform: string, state: string): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(`oauth_state_${platform}`)?.value;
  cookieStore.delete(`oauth_state_${platform}`);
  return stored === state;
}

export async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.id ?? null;
}
