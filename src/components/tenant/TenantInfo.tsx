/**
 * TenantInfo Component
 * 
 * Exibe informações detalhadas do tenant atual
 * Usado no dashboard e páginas de configuração
 */

'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentTenantWithStats, type TenantWithStats } from '@/app/actions/tenants';
import { Loading } from '@/components/ui/loading';

export function TenantInfo() {
  const [tenant, setTenant] = useState<TenantWithStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenant() {
      try {
        const data = await getCurrentTenantWithStats();
        setTenant(data);
      } catch (error) {
        console.error('Error loading tenant:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!tenant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Tenant não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Informações do Tenant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Nome</p>
          <p className="text-lg font-semibold">{tenant.name}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Slug</p>
          <p className="font-mono text-sm">{tenant.slug}</p>
        </div>
        
        {tenant.domain && (
          <div>
            <p className="text-sm text-muted-foreground">Domínio</p>
            <p className="text-sm">{tenant.domain}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{tenant._count.leads}</p>
              <p className="text-xs text-muted-foreground">Leads</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{tenant._count.users}</p>
              <p className="text-xs text-muted-foreground">Usuários</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


