import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// DADOS DE TENANTS
// ============================================

const TENANT_DATA = [
  { name: 'FourSys Tecnologia', slug: 'foursys', domain: 'foursys.com.br' },
  { name: 'TechCorp Brasil', slug: 'techcorp', domain: 'techcorp.com.br' },
  { name: 'Inovação Digital', slug: 'inovacao', domain: null },
];

// ============================================
// DADOS DE LEADS (Por Tenant)
// ============================================

const LEAD_DATA_PER_TENANT = [
  // Tenant 1: FourSys
  [
    { name: 'Carlos Silva', company: 'Tech Solutions Ltda', value: 15000 },
    { name: 'Ana Paula Costa', company: 'Inovação Digital', value: 8500 },
    { name: 'Roberto Mendes', company: 'Consultoria Estratégica', value: 22000 },
    { name: 'Juliana Santos', company: 'Marketing Pro', value: 12000 },
    { name: 'Fernando Oliveira', company: 'Vendas Inteligentes', value: 18500 },
  ],
  // Tenant 2: TechCorp
  [
    { name: 'Mariana Ferreira', company: 'Gestão Empresarial', value: 9500 },
    { name: 'Pedro Almeida', company: 'Automação Industrial', value: 35000 },
    { name: 'Camila Rodrigues', company: 'E-commerce Brasil', value: 14000 },
    { name: 'Lucas Martins', company: 'Logística Express', value: 11000 },
    { name: 'Beatriz Lima', company: 'Recursos Humanos Plus', value: 7500 },
  ],
  // Tenant 3: Inovação
  [
    { name: 'Rafael Souza', company: 'Contabilidade Digital', value: 16000 },
    { name: 'Patrícia Gomes', company: 'Advocacia Corporativa', value: 28000 },
    { name: 'Thiago Pereira', company: 'Desenvolvimento Web', value: 19000 },
    { name: 'Fernanda Ribeiro', company: 'Design Criativo', value: 10500 },
    { name: 'Gustavo Carvalho', company: 'Segurança da Informação', value: 42000 },
  ],
];

const STATUSES = ['prospect', 'qualified', 'proposal', 'closed'] as const;

async function main() {
  console.log('🌱 Iniciando seed do banco de dados (Multi-tenancy)...\n');

  // Limpar dados existentes (ordem importa por causa das FKs)
  console.log('🗑️  Limpando dados antigos...');
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  console.log('✅ Dados antigos removidos\n');

  // ============================================
  // CRIAR TENANTS
  // ============================================
  
  console.log('🏢 Criando Tenants...');
  
  const tenants: any[] = [];
  for (const tenantData of TENANT_DATA) {
    const tenant = await prisma.tenant.create({
      data: tenantData,
    });
    tenants.push(tenant);
    console.log(`   ✅ Tenant criado: ${tenant.name} (${tenant.slug})`);
  }
  console.log(`\n✅ ${tenants.length} tenants criados!\n`);

  // ============================================
  // CRIAR USUÁRIOS (1 admin por tenant)
  // ============================================
  
  console.log('👤 Criando Usuários...');
  
  const users: any[] = [];
  const hashedPassword = await bcrypt.hash('senha123', 10);
  
  for (const tenant of tenants) {
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: `admin@${tenant.slug}.com`,
        name: `Admin ${tenant.name}`,
        password: hashedPassword,
        role: 'admin',
      },
    });
    users.push(user);
    console.log(`   ✅ Usuário criado: ${user.email} (${tenant.name})`);
  }
  console.log(`\n✅ ${users.length} usuários criados!\n`);

  // ============================================
  // CRIAR LEADS (5 por tenant)
  // ============================================
  
  console.log('📊 Criando Leads...');
  
  const allLeads: any[] = [];
  
  for (let i = 0; i < tenants.length; i++) {
    const tenant = tenants[i];
    const leadData = LEAD_DATA_PER_TENANT[i];
    
    console.log(`\n   Tenant: ${tenant.name}`);
    
    for (const data of leadData) {
      // Distribuir leads entre os status
      const randomStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      
      // Gerar AI Score aleatório (0-100)
      const aiScore = Math.floor(Math.random() * 101);
      
      // Gerar data de contato aleatória (últimos 30 dias)
      const daysAgo = Math.floor(Math.random() * 30);
      const lastContact = new Date();
      lastContact.setDate(lastContact.getDate() - daysAgo);

      const lead = await prisma.lead.create({
        data: {
          tenantId: tenant.id, // ← NOVO: Associar ao tenant
          name: data.name,
          company: data.company,
          status: randomStatus,
          value: data.value,
          aiScore,
          email: `${data.name.toLowerCase().replace(/ /g, '.')}@${data.company.toLowerCase().replace(/ /g, '')}.com.br`,
          phone: `(11) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          lastContact,
        },
      });

      allLeads.push(lead);
      console.log(`      ✅ ${lead.name} - ${lead.company} (${lead.status})`);
    }
  }

  console.log(`\n✅ ${allLeads.length} leads criados!\n`);
  
  // ============================================
  // ESTATÍSTICAS GERAIS
  // ============================================
  
  console.log('📊 Estatísticas Gerais:\n');
  
  for (const tenant of tenants) {
    const tenantLeads = allLeads.filter(l => l.tenantId === tenant.id);
    const stats = {
      prospect: tenantLeads.filter(l => l.status === 'prospect').length,
      qualified: tenantLeads.filter(l => l.status === 'qualified').length,
      proposal: tenantLeads.filter(l => l.status === 'proposal').length,
      closed: tenantLeads.filter(l => l.status === 'closed').length,
    };
    const totalValue = tenantLeads.reduce((sum, lead) => sum + lead.value, 0);
    
    console.log(`   🏢 ${tenant.name}:`);
    console.log(`      Total de Leads: ${tenantLeads.length}`);
    console.log(`      Prospect: ${stats.prospect} | Qualificado: ${stats.qualified} | Proposta: ${stats.proposal} | Fechado: ${stats.closed}`);
    console.log(`      Valor Total: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);
  }
  
  const grandTotal = allLeads.reduce((sum, lead) => sum + lead.value, 0);
  console.log(`💰 Valor Total do Pipeline (Todos os Tenants): R$ ${grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📝 Credenciais de Acesso:');
  for (const tenant of tenants) {
    console.log(`   ${tenant.name}: admin@${tenant.slug}.com / senha123`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

