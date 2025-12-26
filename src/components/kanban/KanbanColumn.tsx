'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadCard } from './LeadCard';
import { MoveRight } from 'lucide-react';
import type { Lead, LeadStatus } from '@/app/actions/leads';

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  leads: Lead[];
}

// Cores para cada coluna
const columnColors: Record<LeadStatus, string> = {
  prospect: 'border-l-4 border-l-blue-500',
  qualified: 'border-l-4 border-l-yellow-500',
  proposal: 'border-l-4 border-l-orange-500',
  closed: 'border-l-4 border-l-green-500',
};

export function KanbanColumn({ id, title, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card className={`${columnColors[id]} ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {leads.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[500px]"
        >
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg gap-2">
              <MoveRight className="h-6 w-6 opacity-50" />
              <span>Arraste leads aqui</span>
            </div>
          ) : (
            leads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

