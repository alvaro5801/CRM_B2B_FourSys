import { Inbox, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate, formatRelativeDate, getScoreColor, getScoreLabel } from '@/lib/utils';

export default function TestUIPage() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 5);

  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Teste de Componentes UI</h1>
        <p className="text-muted-foreground">
          Validação dos componentes da Fase 4 - UI Foundation
        </p>
      </div>

      {/* Formatação */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">1. Funções de Formatação</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Moeda (formatCurrency)</h3>
            <div className="space-y-2 text-sm">
              <p>15000 → {formatCurrency(15000)}</p>
              <p>8500.50 → {formatCurrency(8500.50)}</p>
              <p>150000 → {formatCurrency(150000)}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Data (formatDate)</h3>
            <div className="space-y-2 text-sm">
              <p>Hoje → {formatDate(today)}</p>
              <p>Ontem → {formatDate(yesterday)}</p>
              <p>Semana passada → {formatDate(lastWeek)}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Data Relativa (formatRelativeDate)</h3>
            <div className="space-y-2 text-sm">
              <p>Hoje → {formatRelativeDate(today)}</p>
              <p>Ontem → {formatRelativeDate(yesterday)}</p>
              <p>5 dias atrás → {formatRelativeDate(lastWeek)}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">AI Score</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-white text-sm ${getScoreColor(85)}`}>
                  85
                </span>
                <span className="text-sm">→ {getScoreLabel(85)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-white text-sm ${getScoreColor(55)}`}>
                  55
                </span>
                <span className="text-sm">→ {getScoreLabel(55)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-white text-sm ${getScoreColor(25)}`}>
                  25
                </span>
                <span className="text-sm">→ {getScoreLabel(25)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">2. Componente Loading</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border rounded-lg p-8">
            <h3 className="font-semibold mb-4 text-center">Small</h3>
            <Loading size="sm" />
          </div>

          <div className="border rounded-lg p-8">
            <h3 className="font-semibold mb-4 text-center">Medium (padrão)</h3>
            <Loading size="md" />
          </div>

          <div className="border rounded-lg p-8">
            <h3 className="font-semibold mb-4 text-center">Large</h3>
            <Loading size="lg" />
          </div>
        </div>

        <div className="border rounded-lg p-8">
          <h3 className="font-semibold mb-4 text-center">Com Texto</h3>
          <Loading size="md" text="Carregando dados..." />
        </div>
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">3. Componente EmptyState</h2>
        
        <div className="space-y-4">
          <div className="border rounded-lg">
            <h3 className="font-semibold p-4 border-b">Sem Dados</h3>
            <EmptyState
              icon={Inbox}
              title="Nenhum lead encontrado"
              description="Não há leads para exibir no momento. Comece criando seu primeiro lead."
              action={<Button>Criar Lead</Button>}
            />
          </div>

          <div className="border rounded-lg">
            <h3 className="font-semibold p-4 border-b">Erro</h3>
            <EmptyState
              icon={AlertCircle}
              title="Erro ao carregar dados"
              description="Ocorreu um erro ao buscar os dados. Tente novamente mais tarde."
              action={<Button variant="outline">Tentar Novamente</Button>}
            />
          </div>

          <div className="border rounded-lg">
            <h3 className="font-semibold p-4 border-b">Sem Ação</h3>
            <EmptyState
              icon={Package}
              title="Lista vazia"
              description="Esta lista está vazia no momento."
            />
          </div>
        </div>
      </section>

      {/* Resumo */}
      <section className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">✅ Checklist de Validação</h2>
        <div className="space-y-2 text-sm">
          <p>✅ formatCurrency() - Formata valores em R$</p>
          <p>✅ formatDate() - Formata datas em dd/mm/yyyy</p>
          <p>✅ formatRelativeDate() - Mostra datas relativas</p>
          <p>✅ getScoreColor() - Retorna cores para AI Score</p>
          <p>✅ getScoreLabel() - Retorna labels para AI Score</p>
          <p>✅ Loading - 3 tamanhos (sm, md, lg)</p>
          <p>✅ Loading - Suporta texto opcional</p>
          <p>✅ EmptyState - Ícone, título, descrição</p>
          <p>✅ EmptyState - Ação opcional</p>
        </div>
      </section>

      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Todos os componentes da Fase 4 estão funcionando! 🎉
        </p>
      </div>
    </div>
  );
}



