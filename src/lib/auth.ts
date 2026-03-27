import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "./supabase-admin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.META_CLIENT_ID ?? "",
      clientSecret: process.env.META_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "email,public_profile",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user, error } = await getSupabaseAdmin()
          .from("users")
          .select("id, email, name, password_hash, avatar_url, plan")
          .eq("email", credentials.email)
          .single();

        if (error || !user || !user.password_hash) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
          plan: user.plan,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
    newUser: "/signup",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh token every 24 hours
  },

  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, upsert user in Supabase
      if (account?.provider === "google" || account?.provider === "facebook") {
        const { data: existingUser } = await getSupabaseAdmin()
          .from("users")
          .select("id")
          .eq("email", user.email!)
          .single();

        if (existingUser) {
          // Update existing user
          await getSupabaseAdmin()
            .from("users")
            .update({
              name: user.name,
              avatar_url: user.image,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingUser.id);

          user.id = existingUser.id;
        } else {
          // Insert new user
          const { data: newUser } = await getSupabaseAdmin()
            .from("users")
            .insert({
              email: user.email!,
              name: user.name,
              avatar_url: user.image,
            })
            .select("id")
            .single();

          if (newUser) user.id = newUser.id;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      // On initial sign-in, attach Supabase user ID and plan
      if (user) {
        token.id = user.id;
        token.plan = user.plan ?? "free";
      }
      // Refresh plan from DB on subsequent requests to reflect Stripe webhook updates
      if (!user && token.id) {
        const { data } = await getSupabaseAdmin()
          .from("users")
          .select("plan")
          .eq("id", token.id)
          .single();
        if (data) token.plan = data.plan;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.plan = token.plan;
      return session;
    },
  },
};
