import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import TopNav from "@/components/layout/TopNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Not logged in → login page (middleware also handles this, but belt-and-suspenders)
  if (!session?.user) {
    redirect("/login");
  }

  // No active paid plan → pricing page
  // Allow "hobby" and "pro" plans; block "free"/null/undefined
  const plan = session.user.plan;
  if (!plan || plan === "free" || plan === "starter") {
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
