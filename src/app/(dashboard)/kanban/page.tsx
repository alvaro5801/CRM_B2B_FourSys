import { Metadata } from 'next';
import { getLeads } from "@/app/actions/leads";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CreateLeadModal } from "@/components/kanban/CreateLeadModal";

export const metadata: Metadata = {
  title: 'Pipeline | CRM FourSys',
  description: 'Gestão visual de leads com drag & drop',
};

export default async function KanbanPage() {
  // Buscar leads do banco de dados (Server Component)
  const leadsResult = await getLeads();
  
  // Extrair dados do resultado
  const leads = leadsResult.data || [];

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-6 page-content animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Pipeline de Vendas</h2>
          <p className="text-muted-foreground">
            Gerencie seus leads com drag & drop
          </p>
        </div>
        <CreateLeadModal />
      </div>

      <KanbanBoard initialLeads={leads} />
    </div>
  );
}

