import { SidebarProvider } from "@/hooks/useSidebar";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="grid min-h-screen grid-cols-[auto_1fr]">
        <Sidebar />

        <main className="flex flex-col overflow-hidden">
          <Header />

          <div className="flex-1 overflow-y-auto p-6 bg-surface-primary">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
