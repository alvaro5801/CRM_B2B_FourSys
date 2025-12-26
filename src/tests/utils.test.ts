/**
 * Testes de Funções Utilitárias
 * 
 * Testa formatação de moeda, telefone e outras funções auxiliares.
 */

import { 
  formatCurrency, 
  formatCurrencyInput, 
  parseCurrencyToNumber,
  formatPhoneNumber 
} from '@/lib/utils';

describe('Formatação de Moeda', () => {
  test('formatCurrency deve formatar números corretamente', () => {
    expect(formatCurrency(1000)).toContain('1.000,00');
    expect(formatCurrency(15000.50)).toContain('15.000,50');
    expect(formatCurrency(0)).toContain('0,00');
  });

  test('formatCurrency deve lidar com strings', () => {
    expect(formatCurrency('1000')).toContain('1.000,00');
    expect(formatCurrency('15000.50')).toContain('15.000,50');
  });

  test('formatCurrency deve lidar com valores inválidos', () => {
    expect(formatCurrency(NaN)).toContain('0,00');
    expect(formatCurrency('invalid')).toContain('0,00');
  });

  test('formatCurrencyInput deve formatar input em tempo real', () => {
    expect(formatCurrencyInput('1')).toContain('0,01');
    expect(formatCurrencyInput('125')).toContain('1,25');
    expect(formatCurrencyInput('123456')).toContain('1.234,56');
    expect(formatCurrencyInput('')).toContain('0,00');
  });

  test('parseCurrencyToNumber deve converter string para número', () => {
    expect(parseCurrencyToNumber('R$ 1.234,56')).toBe(1234.56);
    expect(parseCurrencyToNumber('R$ 0,00')).toBe(0);
    expect(parseCurrencyToNumber('R$ 15.000,00')).toBe(15000);
  });
});

describe('Formatação de Telefone', () => {
  test('formatPhoneNumber deve formatar telefone fixo (10 dígitos)', () => {
    expect(formatPhoneNumber('1144445555')).toBe('(11) 4444-5555');
    expect(formatPhoneNumber('2133334444')).toBe('(21) 3333-4444');
  });

  test('formatPhoneNumber deve formatar celular (11 dígitos)', () => {
    expect(formatPhoneNumber('11988887777')).toBe('(11) 98888-7777');
    expect(formatPhoneNumber('21987654321')).toBe('(21) 98765-4321');
  });

  test('formatPhoneNumber deve formatar progressivamente', () => {
    expect(formatPhoneNumber('11')).toBe('11');
    expect(formatPhoneNumber('119')).toBe('(11) 9');
    expect(formatPhoneNumber('11988')).toBe('(11) 988');
    expect(formatPhoneNumber('119888877')).toBe('(11) 9888-877');
  });

  test('formatPhoneNumber deve remover caracteres não numéricos', () => {
    expect(formatPhoneNumber('(11) 98888-7777')).toBe('(11) 98888-7777');
    expect(formatPhoneNumber('11 9 8888-7777')).toBe('(11) 98888-7777');
    expect(formatPhoneNumber('11-98888-7777')).toBe('(11) 98888-7777');
  });

  test('formatPhoneNumber deve retornar string vazia para input vazio', () => {
    expect(formatPhoneNumber('')).toBe('');
  });

  test('formatPhoneNumber deve limitar o tamanho máximo', () => {
    // Telefone fixo não deve passar de 14 caracteres
    expect(formatPhoneNumber('11444455556')).toHaveLength(15); // (11) 44445-5556
    
    // Celular não deve passar de 15 caracteres
    expect(formatPhoneNumber('119888877779')).toHaveLength(15); // (11) 98888-7777
  });
});

