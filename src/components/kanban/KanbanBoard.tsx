'use client';

import { useState, useOptimistic } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { updateLeadStatus, type Lead, type LeadStatus } from '@/app/actions/leads';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';

interface KanbanBoardProps {
  initialLeads: Lead[];
}

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: 'prospect', title: 'Prospecção' },
  { id: 'qualified', title: 'Qualificado' },
  { id: 'proposal', title: 'Proposta' },
  { id: 'closed', title: 'Fechado' },
];

const STATUS_LABELS: Record<LeadStatus, string> = {
  prospect: 'Prospecção',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  closed: 'Fechado',
};

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configurar sensores para melhor experiência de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de movimento antes de iniciar drag
      },
    })
  );

  // Optimistic Updates para UI instantânea
  const [optimisticLeads, updateOptimisticLeads] = useOptimistic(
    initialLeads,
    (state, { leadId, newStatus }: { leadId: string; newStatus: LeadStatus }) => {
      return state.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      );
    }
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const leadId = active.id as string;
    const newStatus = over.id as string;

    // Validar se é um status válido
    const validStatuses: LeadStatus[] = ['prospect', 'qualified', 'proposal', 'closed'];
    if (!validStatuses.includes(newStatus as LeadStatus)) {
      console.error('Invalid status:', newStatus);
      setActiveId(null);
      return;
    }

    // Verificar se mudou de coluna
    const lead = optimisticLeads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) {
      setActiveId(null);
      return;
    }

    // Atualização otimista (UI instantânea)
    updateOptimisticLeads({ leadId, newStatus: newStatus as LeadStatus });

    // Atualização no servidor (background)
    try {
      await updateLeadStatus({ id: leadId, status: newStatus as LeadStatus });
      
      // Toast discreto de sucesso
      toast.success('Lead movido!', {
        description: `Movido para ${STATUS_LABELS[newStatus as LeadStatus]}.`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast.error('Erro ao mover lead', {
        description: 'A alteração não foi salva. Tente novamente.',
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeLead = optimisticLeads.find(lead => lead.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map(column => {
          const columnLeads = optimisticLeads.filter(
            lead => lead.status === column.id
          );

          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              leads={columnLeads}
            />
          );
        })}
      </div>

      {/* Overlay durante drag */}
      <DragOverlay>
        {activeLead ? (
          <div className="rotate-3 scale-105">
            <LeadCard lead={activeLead} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

