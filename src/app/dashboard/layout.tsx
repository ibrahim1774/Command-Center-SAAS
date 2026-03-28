import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DEMO_EMAIL } from "@/lib/demo-mode";
import TopNav from "@/components/layout/TopNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Not logged in → login page
  if (!session?.user) {
    redirect("/login");
  }

  // Demo user always gets through
  const isDemo = session.user.email === DEMO_EMAIL;

  // No active paid plan → pricing page
  const plan = session.user.plan;
  if (!isDemo && (!plan || plan === "free" || plan === "starter")) {
    redirect("/#pricing");
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
