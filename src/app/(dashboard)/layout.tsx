/**
 * Dashboard Layout
 * 
 * Layout específico para rotas do dashboard (área logada)
 * Inclui Sidebar e estrutura de navegação
 * 
 * Route Group: (dashboard)
 * Aplica-se a: /, /kanban
 */

import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}

