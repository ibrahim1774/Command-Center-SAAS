import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export const DEMO_EMAIL = "ibrahimttshop@gmail.com";

export async function isDemoUser(req: NextRequest): Promise<boolean> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const email = (token?.email as string) || "";
  return email === DEMO_EMAIL;
}

export function isDemoEmail(email: string | null | undefined): boolean {
  return email === DEMO_EMAIL;
}
