import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// FORMATAÇÃO
// ============================================

/**
 * Formatar valor monetário em R$ (Padrão Ouro)
 * 
 * Utiliza Intl.NumberFormat para garantir formatação consistente
 * em toda a aplicação seguindo o padrão brasileiro.
 * 
 * @param value - Valor numérico ou string
 * @returns String formatada (ex: "R$ 15.000,00")
 * 
 * @example
 * formatCurrency(15000) // "R$ 15.000,00"
 * formatCurrency("15000.50") // "R$ 15.000,50"
 * formatCurrency(NaN) // "R$ 0,00"
 */
export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Formatar input de moeda em tempo real
 * 
 * Aplica máscara monetária conforme o usuário digita.
 * Remove caracteres não numéricos e formata no padrão brasileiro.
 * 
 * @param value - String digitada pelo usuário
 * @returns String formatada (ex: "R$ 1.234,56")
 * 
 * @example
 * formatCurrencyInput("1") // "R$ 0,01"
 * formatCurrencyInput("125") // "R$ 1,25"
 * formatCurrencyInput("123456") // "R$ 1.234,56"
 * formatCurrencyInput("") // "R$ 0,00"
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não for dígito
  const digits = value.replace(/\D/g, "");
  
  // Converte para número e divide por 100 para ter as casas decimais
  const amount = Number(digits) / 100;
  
  // Formata usando a lógica pt-BR
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/**
 * Converter string monetária para número
 * 
 * Remove formatação e converte para número puro para salvar no banco.
 * 
 * @param value - String formatada (ex: "R$ 1.234,56")
 * @returns Número puro (ex: 1234.56)
 * 
 * @example
 * parseCurrencyToNumber("R$ 1.234,56") // 1234.56
 * parseCurrencyToNumber("R$ 0,00") // 0
 */
export function parseCurrencyToNumber(value: string): number {
  // Remove tudo que não for dígito
  const digits = value.replace(/\D/g, "");
  
  // Converte para número e divide por 100
  return Number(digits) / 100;
}

/**
 * Formatar número de telefone brasileiro em tempo real
 * 
 * Aplica máscara dinâmica conforme o usuário digita.
 * Suporta telefone fixo (10 dígitos) e celular (11 dígitos).
 * 
 * @param value - String digitada pelo usuário
 * @returns String formatada
 * 
 * @example
 * formatPhoneNumber("11") // "(11"
 * formatPhoneNumber("1144") // "(11) 44"
 * formatPhoneNumber("1144445555") // "(11) 4444-5555"
 * formatPhoneNumber("11988887777") // "(11) 98888-7777"
 */
export function formatPhoneNumber(value: string): string {
  if (!value) return "";
  
  // Remove tudo que não for número
  const digits = value.replace(/\D/g, "");
  
  // Aplica a máscara conforme a quantidade de dígitos
  if (digits.length <= 10) {
    // Padrão Fixo: (11) 4444-5555
    return digits
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 14);
  } else {
    // Padrão Celular: (11) 98888-7777
    return digits
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  }
}

/**
 * Formatar data no padrão brasileiro
 * @param date - Date ou string ISO
 * @returns String formatada (ex: "25/12/2025")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

/**
 * Formatar data relativa
 * @param date - Date ou string ISO
 * @returns String relativa (ex: "Há 2 dias", "Ontem", "Hoje")
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Hoje';
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `Há ${diffInDays} dias`;
  if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`;
  return formatDate(d);
}

// ============================================
// AI SCORE
// ============================================

/**
 * Obter cor do badge baseado no AI Score
 * @param score - Score de 0 a 100
 * @returns Classe Tailwind de cor
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'bg-green-500';    // Alta prioridade
  if (score >= 40) return 'bg-yellow-500';   // Média prioridade
  return 'bg-red-500';                        // Baixa prioridade
}

/**
 * Obter label do AI Score
 * @param score - Score de 0 a 100
 * @returns Label descritivo
 */
export function getScoreLabel(score: number): string {
  if (score >= 70) return 'Alta';
  if (score >= 40) return 'Média';
  return 'Baixa';
}

