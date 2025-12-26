import * as z from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  company: z.string().min(2, 'Empresa deve ter no mínimo 2 caracteres'),
  value: z.number().min(0, 'Valor não pode ser negativo'),
  status: z.enum(['prospect', 'qualified', 'proposal', 'closed']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        // Remove caracteres não numéricos e valida se tem 10 ou 11 dígitos
        const digits = val.replace(/\D/g, '');
        return digits.length === 10 || digits.length === 11;
      },
      { message: 'Telefone deve ter 10 ou 11 dígitos' }
    ),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;

