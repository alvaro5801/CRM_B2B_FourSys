/**
 * Testes de Isolamento Multi-tenancy
 * 
 * CRÍTICO: Estes testes garantem que os dados de um tenant
 * NUNCA vazam para outro tenant.
 */

import { prisma } from '@/lib/prisma';

describe('Multi-tenancy Data Isolation', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  let lead1Id: string;
  let lead2Id: string;

  beforeAll(async () => {
    // Setup: Criar 2 tenants de teste
    const tenant1 = await prisma.tenant.create({
      data: {
        name: 'Test Tenant 1',
        slug: 'test-tenant-1',
        isActive: true
      }
    });
    tenant1Id = tenant1.id;

    const tenant2 = await prisma.tenant.create({
      data: {
        name: 'Test Tenant 2',
        slug: 'test-tenant-2',
        isActive: true
      }
    });
    tenant2Id = tenant2.id;

    // Criar 1 lead para cada tenant
    const lead1 = await prisma.lead.create({
      data: {
        tenantId: tenant1Id,
        name: 'Lead Tenant 1',
        company: 'Company 1',
        status: 'prospect',
        value: 1000,
        aiScore: 50
      }
    });
    lead1Id = lead1.id;

    const lead2 = await prisma.lead.create({
      data: {
        tenantId: tenant2Id,
        name: 'Lead Tenant 2',
        company: 'Company 2',
        status: 'prospect',
        value: 2000,
        aiScore: 60
      }
    });
    lead2Id = lead2.id;
  });

  afterAll(async () => {
    // Cleanup: Remover dados de teste
    await prisma.lead.deleteMany({
      where: {
        OR: [
          { tenantId: tenant1Id },
          { tenantId: tenant2Id }
        ]
      }
    });

    await prisma.tenant.deleteMany({
      where: {
        OR: [
          { id: tenant1Id },
          { id: tenant2Id }
        ]
      }
    });

    await prisma.$disconnect();
  });

  test('Tenant 1 deve ver apenas seus próprios leads', async () => {
    const leads = await prisma.lead.findMany({
      where: { tenantId: tenant1Id }
    });

    expect(leads.length).toBe(1);
    expect(leads[0].id).toBe(lead1Id);
    expect(leads[0].name).toBe('Lead Tenant 1');
  });

  test('Tenant 2 deve ver apenas seus próprios leads', async () => {
    const leads = await prisma.lead.findMany({
      where: { tenantId: tenant2Id }
    });

    expect(leads.length).toBe(1);
    expect(leads[0].id).toBe(lead2Id);
    expect(leads[0].name).toBe('Lead Tenant 2');
  });

  test('Tenant 1 NÃO deve conseguir acessar lead do Tenant 2', async () => {
    const lead = await prisma.lead.findFirst({
      where: {
        id: lead2Id,
        tenantId: tenant1Id // Tentando acessar lead2 com tenant1
      }
    });

    expect(lead).toBeNull();
  });

  test('Tenant 2 NÃO deve conseguir acessar lead do Tenant 1', async () => {
    const lead = await prisma.lead.findFirst({
      where: {
        id: lead1Id,
        tenantId: tenant2Id // Tentando acessar lead1 com tenant2
      }
    });

    expect(lead).toBeNull();
  });

  test('Aggregate queries devem respeitar isolamento', async () => {
    // Tenant 1: Total = 1000
    const result1 = await prisma.lead.aggregate({
      where: { tenantId: tenant1Id },
      _sum: { value: true }
    });

    expect(result1._sum.value).toBe(1000);

    // Tenant 2: Total = 2000
    const result2 = await prisma.lead.aggregate({
      where: { tenantId: tenant2Id },
      _sum: { value: true }
    });

    expect(result2._sum.value).toBe(2000);
  });

  test('Count queries devem respeitar isolamento', async () => {
    const count1 = await prisma.lead.count({
      where: { tenantId: tenant1Id }
    });

    const count2 = await prisma.lead.count({
      where: { tenantId: tenant2Id }
    });

    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });

  test('Delete cascade deve remover apenas dados do tenant', async () => {
    // Criar tenant temporário com lead
    const tempTenant = await prisma.tenant.create({
      data: {
        name: 'Temp Tenant',
        slug: 'temp-tenant',
        isActive: true
      }
    });

    const tempLead = await prisma.lead.create({
      data: {
        tenantId: tempTenant.id,
        name: 'Temp Lead',
        company: 'Temp Company',
        status: 'prospect',
        value: 500,
        aiScore: 40
      }
    });

    // Deletar tenant (deve deletar lead em cascade)
    await prisma.tenant.delete({
      where: { id: tempTenant.id }
    });

    // Verificar que lead foi deletado
    const deletedLead = await prisma.lead.findUnique({
      where: { id: tempLead.id }
    });

    expect(deletedLead).toBeNull();

    // Verificar que leads de outros tenants ainda existem
    const lead1Still = await prisma.lead.findUnique({
      where: { id: lead1Id }
    });

    const lead2Still = await prisma.lead.findUnique({
      where: { id: lead2Id }
    });

    expect(lead1Still).not.toBeNull();
    expect(lead2Still).not.toBeNull();
  });
});

