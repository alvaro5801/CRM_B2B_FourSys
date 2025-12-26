import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { SalesChart } from "./SalesChart";
import { DollarSign, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardGridProps {
  pipelineTotal: number;
  activeLeads: number;
  conversionRate: number;
}

export function DashboardGrid({ pipelineTotal, activeLeads, conversionRate }: DashboardGridProps) {
  return (
    <div className="space-y-6">
      {/* Métricas no Topo */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Pipeline Total"
          value={formatCurrency(pipelineTotal)}
          description="Valor total de leads em aberto"
          icon={DollarSign}
        />
        <MetricCard
          title="Leads Ativos"
          value={activeLeads}
          description="Leads em negociação"
          icon={Users}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${conversionRate}%`}
          description="Média dos últimos 30 dias"
          icon={TrendingUp}
        />
      </div>

      {/* Gráfico de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas nos Últimos 30 Dias</CardTitle>
          <CardDescription>
            Evolução do pipeline de vendas (dados simulados)
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <SalesChart />
        </CardContent>
      </Card>
    </div>
  );
}

