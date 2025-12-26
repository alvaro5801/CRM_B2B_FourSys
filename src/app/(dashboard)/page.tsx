import Link from "next/link";
import { getDashboardMetrics } from "@/app/actions/leads";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";

export default async function HomePage() {
  // Buscar métricas do banco de dados (Server Component)
  const metricsResult = await getDashboardMetrics();
  
  // Extrair dados do resultado
  const metrics = metricsResult.data || {
    pipelineTotal: 0,
    activeLeads: 0,
    conversionRate: 0,
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-6 page-content animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do seu pipeline de vendas
          </p>
        </div>
      </div>

      {metrics.activeLeads === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Bem-vindo ao CRM FourSys!</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Comece criando seu primeiro lead e acompanhe o crescimento do seu pipeline de vendas.
            </p>
            <Link href="/kanban">
              <Button size="lg" className="button-hover">
                <Plus className="mr-2 h-5 w-5" />
                Criar Primeiro Lead
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DashboardGrid
          pipelineTotal={metrics.pipelineTotal}
          activeLeads={metrics.activeLeads}
          conversionRate={metrics.conversionRate}
        />
      )}
    </div>
  );
}

