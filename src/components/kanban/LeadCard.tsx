'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Phone, Sparkles, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditLeadModal } from './EditLeadModal';
import { deleteLead } from '@/app/actions/leads';
import type { Lead } from '@/app/actions/leads';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

// Função para determinar a cor do Badge baseado no AI Score
function getScoreBadgeVariant(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'danger';
}

export function LeadCard({ lead, isDragging = false }: LeadCardProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading('Excluindo lead...');
    
    try {
      await deleteLead(lead.id);
      toast.success('Lead excluído com sucesso!', { id: toastId });
      router.refresh();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Erro ao excluir lead', { id: toastId });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="cursor-grab active:cursor-grabbing touch-none relative"
      >
        <Card className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${isDragging ? 'opacity-50 rotate-3' : ''}`}>
          <CardContent className="p-4 space-y-3">
            {/* Header: Nome + AI Score + Menu */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0" {...listeners} {...attributes}>
                <h3 className="font-semibold text-sm truncate">{lead.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{lead.company}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={getScoreBadgeVariant(lead.aiScore)}
                  className={cn(
                    "flex items-center gap-1",
                    lead.aiScore > 85 && "animate-pulse"
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  {lead.aiScore}
                </Badge>
                
                {/* Menu de Ações */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Valor */}
            <div className="pt-2 border-t" {...listeners} {...attributes}>
              <div className="text-lg font-bold text-primary font-mono text-right">
                {formatCurrency(lead.value)}
              </div>
            </div>

            {/* Contatos (Opcionais) */}
            {(lead.email || lead.phone) && (
              <div className="space-y-1 text-xs text-muted-foreground" {...listeners} {...attributes}>
                {lead.email && (
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{lead.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Último Contato */}
            <div className="text-xs text-muted-foreground pt-2 border-t" {...listeners} {...attributes}>
              Último contato: {new Date(lead.lastContact).toLocaleDateString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <EditLeadModal 
        lead={lead} 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen} 
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead <strong>{lead.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

