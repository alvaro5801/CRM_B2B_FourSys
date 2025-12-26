'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { updateLead } from '@/app/actions/leads';
import { createLeadSchema, type CreateLeadFormData } from '@/lib/validations/lead';
import { formatCurrencyInput, parseCurrencyToNumber, formatPhoneNumber } from '@/lib/utils';
import type { Lead } from '@/app/actions/leads';

interface EditLeadModalProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeadModal({ lead, open, onOpenChange }: EditLeadModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [valueDisplay, setValueDisplay] = useState('R$ 0,00');

  const form = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: lead.name,
      company: lead.company,
      value: lead.value,
      status: lead.status,
      email: lead.email || '',
      phone: lead.phone || '',
    },
  });

  // Atualizar valueDisplay quando o modal abrir
  useEffect(() => {
    if (open) {
      setValueDisplay(formatCurrencyInput((lead.value * 100).toString()));
      form.reset({
        name: lead.name,
        company: lead.company,
        value: lead.value,
        status: lead.status,
        email: lead.email || '',
        phone: lead.phone || '',
      });
    }
  }, [open, lead, form]);

  const onSubmit = async (data: CreateLeadFormData) => {
    setIsLoading(true);
    try {
      // Converter o valor formatado para número antes de enviar
      const leadData = {
        id: lead.id,
        ...data,
        value: parseCurrencyToNumber(valueDisplay),
      };
      await updateLead(leadData);
      toast.success('Lead atualizado com sucesso!', {
        description: `${data.name} foi atualizado.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating lead:', error);
      
      // Exibir mensagem de erro específica
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao atualizar lead';
      
      toast.error('Erro ao atualizar lead', {
        description: errorMessage,
        duration: 5000, // Mostrar por mais tempo para erros de duplicata
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] animate-slide-in">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription>
            Atualize os dados do lead. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Lead *</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Empresa */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Tech Solutions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor e Status (lado a lado) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor *</FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        inputMode="numeric"
                        placeholder="R$ 0,00"
                        value={valueDisplay}
                        onChange={(e) => {
                          const formatted = formatCurrencyInput(e.target.value);
                          setValueDisplay(formatted);
                          // Atualiza o valor numérico no formulário
                          field.onChange(parseCurrencyToNumber(formatted));
                        }}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prospect">Prospecção</SelectItem>
                        <SelectItem value="qualified">Qualificado</SelectItem>
                        <SelectItem value="proposal">Proposta</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      inputMode="tel"
                      placeholder="(11) 98888-7777"
                      value={field.value}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                      maxLength={15}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

